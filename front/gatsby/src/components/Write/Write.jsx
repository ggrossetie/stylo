import React, { useCallback, useEffect, useRef, useState } from 'react'
import { connect, useDispatch } from 'react-redux'
import 'codemirror/mode/markdown/markdown'
import { Controlled as CodeMirror } from 'react-codemirror2'
import throttle from 'lodash/throttle'
import debounce from 'lodash/debounce'

import askGraphQL from '../../helpers/graphQL'
import styles from './write.module.scss'

import WriteLeft from './WriteLeft'
import WriteRight from './WriteRight'
import Compare from './Compare'
import CompareSelect from './CompareSelect'
import Loading from '../Loading'
import 'codemirror/lib/codemirror.css'

const mapStateToProps = ({ activeUser, article, articleVersions, applicationConfig }) => {
  return { activeUser, article, articleVersions, applicationConfig }
}

function ConnectedWrite ({ version: currentVersion, id: articleId, compareTo, activeUser, article, articleVersions: versions, applicationConfig }) {
  const [readOnly, setReadOnly] = useState(Boolean(currentVersion))
  const dispatch = useDispatch()
  const deriveArticleStructureAndStats = useCallback(
    throttle(({ md }) => {
      dispatch({ type: 'UPDATE_ARTICLE_STATS', md })
      dispatch({ type: 'UPDATE_ARTICLE_STRUCTURE', md })
    }, 250, { leading: false, trailing: true }),
    []
  )
  const updateArticleText = useCallback(
    debounce(({ md }) => {
      dispatch({
        type: 'UPDATE_CURRENT_ARTICLE_TEXT',
        text: md,
      })
    }, 1000),
    []
  )
  const updateArticleMetadata = useCallback(
    debounce(({ yaml }) => {
      dispatch({
        type: 'UPDATE_CURRENT_ARTICLE_METADATA',
        metadata: yaml,
      })
    }, 1000),
    []
  )

  const fullQuery = `query($article:ID!, $hasVersion: Boolean!, $version:ID!) {
    article(article:$article) {
      _id
      title
      zoteroLink
      owners {
        displayName
      }
      versions {
        _id
        version
        revision
        message
        autosave
        updatedAt
        owner {
          displayName
        }
      }

      live @skip (if: $hasVersion) {
        md
        bib
        yaml
        message
        owner {
          displayName
        }
      }
    }

    version(version: $version) @include (if: $hasVersion) {
      _id
      md
      bib
      yaml
      message
      revision
      version
      owner{
        displayName
      }
    }
  }`

  const instanceCM = useRef(null)

  const handleReload = useCallback(() => {
    setNeedReload(true)
  }, [])

  const handleUpdateCursorPosition = useCallback((line) => {
    try {
      const editor = instanceCM.current.editor
      editor.focus()
      editor.setCursor(line, 0)
      editor.execCommand('goLineEnd')
    } catch (err) {
      console.error('Unable to update CodeMirror cursor position', err)
    }
  }, [instanceCM])

  const variables = {
    user: activeUser && activeUser._id,
    article: articleId,
    version: currentVersion || '0123456789ab',
    hasVersion: typeof currentVersion === 'string'
  }

  const [graphqlError, setError] = useState()
  const [isLoading, setIsLoading] = useState(true)
  const [articleInfos, setArticleInfos] = useState({
    title: '',
    owners: [],
    zoteroLink: '',
  })

  const codeMirrorOptions = {
    mode: 'markdown',
    lineWrapping: true,
    lineNumbers: false,
    autofocus: true,
    viewportMargin: Infinity,
    spellcheck: true,
    extraKeys: {
      'Shift-Ctrl-Space': function (cm) {
        cm.replaceSelection('\u00a0')
      },
    },
  }

  const handleMDCM = async (___, __, md) => {
    deriveArticleStructureAndStats({ md })
    dispatch({
      type: 'SET_CURRENT_ARTICLE_TEXT',
      text: md,
    })
    updateArticleText({ md })
  }
  const handleYaml = async (yaml) => {
    dispatch({
      type: 'SET_CURRENT_ARTICLE_METADATA',
      text: md,
    })
    updateArticleMetadata({ yaml })
  }

  //Reload when version switching
  useEffect(() => {
    setIsLoading(true)
    setReadOnly(currentVersion)
    ;(async () => {
      const data = await askGraphQL(
        { query: fullQuery, variables },
        'fetching Live version',
        null,
        applicationConfig
      ).then(({ version, article }) => ({ version, article })
      ).catch((error) => {
        setError(error)
        return {}
      })

      if (data?.article) {
        const article = data.article
        const version = currentVersion ? data.version : article.live
        console.log({version})
        dispatch({
          type: 'UPDATE_CURRENT_ARTICLE',
          article: {
            ...version,
            _id: article._id,
            title: article.title,
          },
        })
        setArticleInfos({
          _id: article._id,
          title: article.title,
          zoteroLink: article.zoteroLink,
          owners: article.owners.map((o) => o.displayName),
        })
        const md = version.md
        const bib = version.bib
        // REMIND: we should use a `batch` to combine (and avoid multiple re-render)
        dispatch({ type: 'UPDATE_ARTICLE_STATS', md })
        dispatch({ type: 'UPDATE_ARTICLE_STRUCTURE', md })
        dispatch({ type: 'UPDATE_ARTICLE_BIB', bib })
        dispatch({ type: 'SET_ARTICLE_VERSIONS', versions: article.versions })
      }

      setIsLoading(false)
    })()
  }, [currentVersion])

  if (graphqlError) {
    return (
      <section className={styles.container}>
        <article className={styles.error}>
          <h2>Error</h2>
          <p>{graphqlError[0]?.message || 'Article not found.'}</p>
        </article>
      </section>
    )
  }

  if (isLoading) {
    return <Loading/>
  }

  return (
    <section className={styles.container}>
      <WriteLeft
        bib={article.bib}
        article={articleInfos}
        md={article.md}
        version={article.version}
        revision={article.revision}
        versionId={article._id}
        compareTo={compareTo}
        selectedVersion={currentVersion}
        readOnly={readOnly}
        onTableOfContentClick={handleUpdateCursorPosition}
      />
      <WriteRight {...article} handleYaml={handleYaml} readOnly={readOnly}/>
      {compareTo && (
        <CompareSelect
          compareTo={compareTo}
          live={article}
          versions={versions}
          readOnly={readOnly}
          article={articleInfos}
          selectedVersion={currentVersion}
        />
      )}

      <article className={styles.article}>
        <>
          {readOnly && <pre>{article.md}</pre>}
          {!readOnly && (
            <CodeMirror
              value={article.md}
              cursor={{ line: 0, character: 0 }}
              editorDidMount={(_) => {
                window.scrollTo(0, 0)
                //editor.scrollIntoView({ line: 0, ch: 0 })
              }}
              onBeforeChange={handleMDCM}
              options={codeMirrorOptions}
              ref={instanceCM}
            />
          )}
          {compareTo && <Compare compareTo={compareTo} live={article}/>}
        </>
      </article>
    </section>
  )
}

const Write = connect(mapStateToProps)(ConnectedWrite)

export default Write
