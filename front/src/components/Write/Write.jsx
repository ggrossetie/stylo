import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Code, Text, useToasts } from '@geist-ui/core'
import clsx from 'clsx'
import throttle from 'lodash.throttle'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux'
import { Route, Switch, useParams, useRouteMatch } from 'react-router-dom'

import { applicationConfig } from '../../config.js'
import { useGraphQLClient } from '../../helpers/graphQL.js'
import { useModal } from '../../hooks/modal.js'

import ArticleStats from '../ArticleStats.jsx'
import ErrorMessageCard from '../ErrorMessageCard.jsx'
import Modal from '../Modal.jsx'
import FormActions from '../molecules/FormActions.jsx'
import Loading from '../molecules/Loading.jsx'

import { useActiveUserId } from '../../hooks/user'

import ArticleEditorMenu from './ArticleEditorMenu.jsx'
import ArticleEditorMetadata from './ArticleEditorMetadata.jsx'

import PreviewHtml from './PreviewHtml'
import PreviewPaged from './PreviewPaged'
import MonacoEditor from './providers/monaco/Editor'
import WorkingVersion from './WorkingVersion'

import { stopSoloSession } from './Write.graphql'

import styles from './write.module.scss'
import { useArticle } from '../../hooks/article.js'

const MODES_PREVIEW = 'preview'
const MODES_READONLY = 'readonly'
const MODES_WRITE = 'write'

export function deriveModeFrom({ path, currentVersion }) {
  if (path === '/article/:id/preview') {
    return MODES_PREVIEW
  } else if (currentVersion) {
    return MODES_READONLY
  }

  return MODES_WRITE
}

/**
 * @return {Element}
 */
export default function Write() {
  const { setToast } = useToasts()
  const { backendEndpoint } = applicationConfig
  const { t } = useTranslation()
  const { version: currentVersion, id: articleId, compareTo } = useParams()
  const workingArticle = useSelector(
    (state) => state.workingArticle,
    shallowEqual
  )
  const userId = useActiveUserId()
  const dispatch = useDispatch()
  const routeMatch = useRouteMatch()
  const [collaborativeSessionActive, setCollaborativeSessionActive] =
    useState(false)
  const [soloSessionActive, setSoloSessionActive] = useState(false)
  const mode = useMemo(() => {
    if (collaborativeSessionActive || soloSessionActive) {
      return MODES_READONLY
    }
    return deriveModeFrom({ currentVersion, path: routeMatch.path })
  }, [
    currentVersion,
    routeMatch.path,
    collaborativeSessionActive,
    soloSessionActive,
  ])
  const [soloSessionTakenOverBy, setSoloSessionTakenOverBy] = useState('')

  const {
    updateText,
    content,
    article,
    isLoading: isArticleLoading,
    error,
  } = useArticle({
    articleId,
    version: currentVersion,
  })

  const { query } = useGraphQLClient()

  const collaborativeSessionActiveModal = useModal()
  const soloSessionActiveModal = useModal()
  const soloSessionTakeOverModal = useModal()

  const PreviewComponent = useMemo(
    () => (article?.preview?.stylesheet ? PreviewPaged : PreviewHtml),
    [article?.preview?.stylesheet, currentVersion]
  )

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
  const handleTextUpdate = async (text) => {
    deriveArticleStructureAndStats({ text })
    // debounce logic + dirty/saving
    await updateText(text)
  }

  const handleStateUpdated = useCallback(
    (event) => {
      const parsedData = JSON.parse(event.data)
      if (parsedData.articleStateUpdated) {
        const articleStateUpdated = parsedData.articleStateUpdated
        if (articleId === articleStateUpdated._id) {
          if (
            articleStateUpdated.soloSession &&
            articleStateUpdated.soloSession.id
          ) {
            if (userId !== articleStateUpdated.soloSession.creator._id) {
              setSoloSessionTakenOverBy(
                articleStateUpdated.soloSession.creatorUsername
              )
              setSoloSessionActive(true)
              soloSessionTakeOverModal.show()
            }
          } else if (
            articleStateUpdated.collaborativeSession &&
            articleStateUpdated.collaborativeSession.id
          ) {
            collaborativeSessionActiveModal.show()
            setCollaborativeSessionActive(true)
          }
        }
      }
    },
    [articleId]
  )

  useEffect(() => {
    // FIXME: should retrieve extensions.type 'COLLABORATIVE_SESSION_CONFLICT'
    if (
      workingArticle &&
      workingArticle.state === 'saveFailure' &&
      workingArticle.stateMessage ===
        'Active collaborative session, cannot update the working copy.'
    ) {
      collaborativeSessionActiveModal.show()
      setCollaborativeSessionActive(true)
    }
  }, [workingArticle])

  // Reload when version switching
  useEffect(() => {
    if (article) {
      if (article.soloSession && article.soloSession.id) {
        if (userId !== article.soloSession.creator._id) {
          setSoloSessionActive(true)
          soloSessionActiveModal.show()
        }
      }
      setCollaborativeSessionActive(
        article.collaborativeSession && article.collaborativeSession.id
      )
      const collaborativeSessionActiveModalVisible =
        article.collaborativeSession && article.collaborativeSession.id
      if (collaborativeSessionActiveModalVisible) {
        collaborativeSessionActiveModal.show()
      }
      const { md, bib, metadata } = content
      batch(() => {
        dispatch({ type: 'SET_ARTICLE_VERSIONS', versions: article.versions })
        dispatch({ type: 'UPDATE_ARTICLE_STATS', md })
        dispatch({ type: 'UPDATE_ARTICLE_STRUCTURE', md })
        dispatch({ type: 'SET_WORKING_ARTICLE_TEXT', text: md })
        dispatch({ type: 'SET_WORKING_ARTICLE_METADATA', metadata })
        dispatch({
          type: 'SET_WORKING_ARTICLE_BIBLIOGRAPHY',
          bibliography: bib,
        })
        dispatch({
          type: 'SET_WORKING_ARTICLE_UPDATED_AT',
          updatedAt: article.updatedAt,
        })
      })
    }

    return async () => {
      try {
        await query({ query: stopSoloSession, variables: { articleId } })
      } catch (err) {
        if (
          err &&
          err.messages &&
          err.messages.length > 0 &&
          err.messages[0].extensions &&
          err.messages[0].extensions.type === 'UNAUTHORIZED'
        ) {
          // cannot end solo session... ignoring
        } else {
          setToast({
            type: 'error',
            text: `Unable to end solo session: ${err.toString()}`,
          })
        }
      }
    }
  }, [article, content])

  useEffect(() => {
    let events
    if (!isArticleLoading) {
      events = new EventSource(`${backendEndpoint}/events?userId=${userId}`)
      events.onmessage = (event) => {
        handleStateUpdated(event)
      }
    }
    return () => {
      if (events) {
        events.close()
      }
    }
  }, [isArticleLoading, handleStateUpdated])

  if (isArticleLoading) {
    return <Loading />
  }

  if (error) {
    return (
      <section className={styles.errorContainer}>
        <ErrorMessageCard title="Error">
          <Text>
            <Code>{error?.message || error.toString()}</Code>
          </Text>
        </ErrorMessageCard>
      </section>
    )
  }

  return (
    <section className={styles.container}>
      <Helmet>
        <title>{t('article.page.title', { title: article.title })}</title>
      </Helmet>
      <Modal
        {...collaborativeSessionActiveModal.bindings}
        title={t('article.collaborativeSessionActive.title')}
      >
        {t('article.collaborativeSessionActive.message')}
        <FormActions
          onCancel={() => collaborativeSessionActiveModal.close()}
          onSubmit={() => collaborativeSessionActiveModal.close()}
          submitButton={{
            text: t('modal.confirmButton.text'),
            title: t('modal.confirmButton.text'),
          }}
        />
      </Modal>

      <Modal
        {...soloSessionActiveModal.bindings}
        title={t('article.soloSessionActive.title')}
      >
        {t('article.soloSessionActive.message')}
        <FormActions
          onCancel={() => soloSessionActiveModal.close()}
          onSubmit={() => soloSessionActiveModal.close()}
          submitButton={{
            text: t('modal.confirmButton.text'),
            title: t('modal.confirmButton.text'),
          }}
        />
      </Modal>

      <Modal
        {...soloSessionTakeOverModal.bindings}
        title={t('article.soloSessionTakeOver.title')}
      >
        {t('article.soloSessionTakeOver.message', {
          username: soloSessionTakenOverBy,
        })}
        <FormActions
          onCancel={() => soloSessionTakeOverModal.close()}
          onSubmit={() => soloSessionTakeOverModal.close()}
          submitButton={{
            text: t('modal.confirmButton.text'),
            title: t('modal.confirmButton.text'),
          }}
        />
      </Modal>

      <ArticleEditorMenu
        articleInfos={article}
        compareTo={compareTo}
        selectedVersion={currentVersion}
        readOnly={mode === MODES_READONLY}
      />
      <article className={clsx({ [styles.article]: mode !== MODES_PREVIEW })}>
        <WorkingVersion
          articleInfos={article}
          live={content}
          selectedVersion={currentVersion}
          mode={mode}
        />

        <Switch>
          <Route path="*/preview" exact>
            <PreviewComponent
              preview={article.preview}
              metadata={content.metadata}
            />
          </Route>
          <Route path="*">
            <MonacoEditor
              text={content.md}
              readOnly={mode === MODES_READONLY}
              onTextUpdate={handleTextUpdate}
              articleId={article._id}
              selectedVersion={currentVersion}
              compareTo={compareTo}
              currentArticleVersion={content.version}
            />

            <ArticleStats />
          </Route>
        </Switch>
      </article>
      <ArticleEditorMetadata
        articleId={article._id}
        metadata={content.metadata}
        readOnly={mode === MODES_READONLY}
      />
    </section>
  )
}
