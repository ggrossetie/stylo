import React, { useCallback, useEffect, useRef, useState } from 'react'
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import Editor from "@monaco-editor/react";
import throttle from 'lodash.throttle'
import debounce from 'lodash.debounce'

import styles from './write.module.scss'

import askGraphQL from '../../helpers/graphQL'

import WriteLeft from './WriteLeft'
import WriteRight from './WriteRight'
import Compare from './Compare'
import Loading from '../Loading'
import { registerBibliographyCompletion } from "../../helpers/monacoEditor";

function Write () {
  const { version: currentVersion, id: articleId, compareTo } = useParams()
  const articleBibTeXEntries = useSelector(state => state.workingArticle.bibliography.entries)
  const userId = useSelector((state) => state.activeUser._id)
  const applicationConfig = useSelector(
    (state) => state.applicationConfig,
    shallowEqual
  )
  const [readOnly, setReadOnly] = useState(Boolean(currentVersion))
  const dispatch = useDispatch()

  const monacoRef = useRef(null)

  function handleEditorDidMount (editor, monaco) {
    monacoRef.current = editor
    editor.addAction({
      // An unique identifier of the contributed action.
      id: 'bold',

      // A label of the action that will be presented to the user.
      label: 'Bold',

      // An optional array of keybindings for the action.
      keybindings: [
        monaco.KeyMod.chord(
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_B,
        )
      ],

      // A precondition for this action.
      precondition: null,

      // A rule to evaluate on top of the precondition in order to dispatch the keybindings.
      keybindingContext: null,

      contextMenuGroupId: 'navigation',

      contextMenuOrder: 1.5,

      // Method that will be executed when the action is triggered.
      // @param editor The editor instance is passed in as a convenience
      run: function (ed) {
        alert("i'm running => " + ed.getPosition());
      }
    });
    editor.addAction({
      // An unique identifier of the contributed action.
      id: 'italic',

      // A label of the action that will be presented to the user.
      label: 'Italic',

      // An optional array of keybindings for the action.
      keybindings: [
        monaco.KeyMod.chord(
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_I
        )
      ],

      // A precondition for this action.
      precondition: null,

      // A rule to evaluate on top of the precondition in order to dispatch the keybindings.
      keybindingContext: null,

      contextMenuGroupId: 'navigation',

      contextMenuOrder: 1.5,

      // Method that will be executed when the action is triggered.
      // @param editor The editor instance is passed in as a convenience
      run: function (ed) {
        console.log('getSelection.getPosition', ed.getSelection().getPosition())
        console.log('getSelection.getPosition', ed.getPosition())
        console.log('getSelection.getStartPosition', ed.getSelection().getStartPosition())
        console.log('getSelection.getEndPosition', ed.getSelection().getEndPosition())
        console.log('getSelection.getSelections', ed.getSelections())
        const selections = ed.getSelections()
        ed.setSelections(selections.map((selection) => {
          editor.getModel().pushEditOperations([], [
            {
              range: new monaco.Range(selection.getStartPosition().lineNumber, selection.getStartPosition().column, selection.getStartPosition().lineNumber, selection.getStartPosition().column),
              text: '**',
              forceMoveMarkers: false
            },
            {
              range: new monaco.Range(selection.getEndPosition().lineNumber, selection.getEndPosition().column, selection.getEndPosition().lineNumber, selection.getEndPosition().column),
              text: '**',
              forceMoveMarkers: false
            }
          ])
          return selection
            .setStartPosition(selection.getStartPosition().lineNumber, selection.getStartPosition().column + 2)
            .setEndPosition(selection.getEndPosition().lineNumber, selection.getEndPosition().column + 2)
          /*
          editor.executeEdits('make-bold', [{
            range: selection.getStartPosition(),
            text: '**',
          },
            {
              range: selection.getEndPosition(),
              text: '**'
            }
          ])
           */
        }))
      }
    });
    editor.addAction({
      // An unique identifier of the contributed action.
      id: 'interpunct',

      // A label of the action that will be presented to the user.
      label: 'Middle Dot',

      // An optional array of keybindings for the action.
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_M,
      ],

      // A precondition for this action.
      precondition: null,

      // A rule to evaluate on top of the precondition in order to dispatch the keybindings.
      keybindingContext: null,

      contextMenuGroupId: 'navigation',

      contextMenuOrder: 1.5,

      // Method that will be executed when the action is triggered.
      // @param editor The editor instance is passed in as a convenience
      run: function (ed) {
        alert("i'm running => " + ed.getPosition());
      }
    });
    registerBibliographyCompletion(monaco, articleBibTeXEntries)
  }

  const deriveArticleStructureAndStats = useCallback(
    throttle(
      ({ text }) => {
        dispatch({ type: 'UPDATE_ARTICLE_STATS', md: text })
        dispatch({ type: 'UPDATE_ARTICLE_STRUCTURE', md: text })
      },
      250,
      { leading: false, trailing: true }
    ),
    []
  )
  const setWorkingArticleDirty = useCallback(
    debounce(
      async () => {
        dispatch({ type: 'SET_WORKING_ARTICLE_STATE', workingArticleState: 'saving' })
      },
      1000,
      { leading: true, trailing: false }
    ),
    []
  )
  const updateWorkingArticleText = useCallback(
    debounce(
      async ({ text }) => {
        dispatch({ type: 'UPDATE_WORKING_ARTICLE_TEXT', articleId, text })
      },
      1000,
      { leading: false, trailing: true }
    ),
    []
  )
  const updateWorkingArticleMetadata = useCallback(
    debounce(
      ({ metadata }) => {
        dispatch({
          type: 'UPDATE_WORKING_ARTICLE_METADATA',
          articleId,
          metadata,
        })
      },
      1000,
      { leading: false, trailing: true }
    ),
    []
  )

  const fullQuery = `query($article:ID!, $hasVersion: Boolean!, $version:ID!) {
    article(article:$article) {
      _id
      title
      zoteroLink
      updatedAt

      owner {
        displayName
      }

      contributors {
        user {
          displayName
        }
      }

      versions {
        _id
        version
        revision
        message
        updatedAt
        owner {
          displayName
        }
      }

      workingVersion @skip (if: $hasVersion) {
        md
        bib
        yaml
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

  const handleUpdateCursorPosition = useCallback(
    (line) => {
      try {
        const editor = monacoRef.current
        editor?.focus()
        const model = editor?.getModel()
        const endOfLineColumn = model.getLineMaxColumn(line + 1)
        editor?.setPosition({ lineNumber: line + 1, column: endOfLineColumn })
        editor?.revealLine(line + 1, 1) // smooth
      } catch (err) {
        console.error('Unable to update Monaco cursor position', err)
      }
    },
    [monacoRef]
  )

  const variables = {
    user: userId,
    article: articleId,
    version: currentVersion || '0123456789ab',
    hasVersion: typeof currentVersion === 'string',
  }

  const [graphqlError, setError] = useState()
  const [isLoading, setIsLoading] = useState(true)
  const [live, setLive] = useState({})
  const [articleInfos, setArticleInfos] = useState({
    title: '',
    owner: '',
    contributors: [],
    zoteroLink: '',
  })

  const handleUpdateWorkingArticleText = (text) => {
    deriveArticleStructureAndStats({ text })
    updateWorkingArticleText({ text })
    setWorkingArticleDirty()
    return setLive({ ...live, md: text })
  }

  const handleYaml = (metadata) => {
    updateWorkingArticleMetadata({ metadata })
    setWorkingArticleDirty()
    return setLive({ ...live, yaml: metadata })
  }

  // Reload when version switching
  useEffect(() => {
    setIsLoading(true)
    setReadOnly(Boolean(currentVersion))
    ;(async () => {
      const data = await askGraphQL(
        {
          query: fullQuery,
          variables,
        },
        'Fetching article',
        null,
        applicationConfig
      )
        .then(({ version, article }) => ({ version, article }))
        .catch((error) => {
          setError(error)
          return {}
        })

      if (data?.article) {
        const article = data.article
        let currentArticle
        if (currentVersion) {
          currentArticle = {
            bib: data.version.bib,
            md: data.version.md,
            yaml: data.version.yaml,
            version: {
              message: data.version.message,
              major: data.version.version,
              minor: data.version.revision,
            },
          }
        } else {
          currentArticle = article.workingVersion
        }
        setLive(currentArticle)
        setArticleInfos({
          _id: article._id,
          title: article.title,
          owner: article.owner,
          contributors: article.contributors,
          zoteroLink: article.zoteroLink,
          updatedAt: article.updatedAt,
        })

        const { md, bib } = currentArticle

        batch(() => {
          dispatch({ type: 'SET_ARTICLE_VERSIONS', versions: article.versions })
          dispatch({ type: 'UPDATE_ARTICLE_STATS', md })
          dispatch({ type: 'UPDATE_ARTICLE_STRUCTURE', md })
          dispatch({ type: 'SET_WORKING_ARTICLE_BIBLIOGRAPHY', bibliography: bib })
          dispatch({
            type: 'SET_WORKING_ARTICLE_UPDATED_AT',
            updatedAt: article.updatedAt,
          })
        })
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
        articleInfos={articleInfos}
        compareTo={compareTo}
        selectedVersion={currentVersion}
        readOnly={readOnly}
        onTableOfContentClick={handleUpdateCursorPosition}
      />
      <WriteRight
        yaml={live.yaml}
        handleYaml={handleYaml}
        readOnly={readOnly}
      />
      <article>
        <>
          {!compareTo &&
          <>
            <ul className={styles.editorActions}>
              <li className={styles.boldIcon}></li>
              <li className={styles.italicIcon}></li>
              <li className={styles.interpunctIcon}>·</li>
            </ul>
            <Editor
              defaultValue={live.md}
              height="calc(80vh - 49px)"
              className={styles.editor}
              defaultLanguage="markdown"
              onChange={(value) => {
                handleUpdateWorkingArticleText(value)
              }}
              options={{
                readOnly: readOnly,
                wordBasedSuggestions: false,
                overviewRulerLanes: 0,
                hideCursorInOverviewRuler: true,
                overviewRulerBorder: false,
                scrollBeyondLastLine: false,
                minimap: {
                  enabled: false
                }
              }}
              onMount={handleEditorDidMount}
            />
          </>
          }
          {compareTo && <Compare
            articleId={articleInfos._id}
            selectedVersion={currentVersion}
            compareTo={compareTo}
            currentArticleVersion={live.version}
            readOnly={readOnly}
            md={live.md}
          />}
        </>
      </article>
    </section>
  )
}

Write.propTypes = {
  version: PropTypes.string,
  id: PropTypes.string,
  compareTo: PropTypes.string
}

export default Write
