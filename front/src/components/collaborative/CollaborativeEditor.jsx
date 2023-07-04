import { Loading } from '@geist-ui/core'
import React, { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import useGraphQL from '../../hooks/graphql.js'
import NewVersionItem from '../timeline/NewVersionItem.jsx'
import Timeline from '../timeline/Timeline.jsx'
import VersionItem from '../timeline/VersionItem.jsx'

import { getCollaborativeSession } from './CollaborativeSession.graphql'

import CollaborativeEditorArticleHeader from './CollaborativeEditorArticleHeader.jsx'
import CollaborativeEditorArticleStats from './CollaborativeEditorArticleStats.jsx'
import CollaborativeSessionError from './CollaborativeSessionError.jsx'
import CollaborativeTextEditor from './CollaborativeTextEditor.jsx'

import styles from './CollaborativeEditor.module.scss'


export default function CollaborativeEditor () {
  const { sessionId: collaborativeSessionId, articleId } = useParams()

  const {
    data: collaborativeSessionData,
    isLoading: collaborativeSessionLoading,
    mutate: mutateCollaborativeSession,
  } = useGraphQL({ query: getCollaborativeSession, variables: { articleId } })

  const handleCollaborativeSessionStateUpdated = useCallback(({ state }) => {
    if (state === 'ended') {
      mutateCollaborativeSession()
    }
  }, [])

  if (collaborativeSessionLoading) {
    return <Loading/>
  }

  if (collaborativeSessionData?.article?.collaborativeSession?.id !== collaborativeSessionId) {
    return <div className={styles.errorContainer}>
      <CollaborativeSessionError error="notFound"/>
    </div>
  }

  const collaborativeSessionCreatorId = collaborativeSessionData?.article?.collaborativeSession?.creator?._id

  return (
    <>
      <div className={styles.timeline}>
        <Timeline items={[
          {
            key: 'new',
            state: 'inactive',
            content: <NewVersionItem/>
          },
          {
            key: '1.0',
            content: <VersionItem title="v1.0" description="First publication!" createdAt="il y a quelques instants"
                                  createdByName="Guillaume"/>
          },
          {
            key: '0.3',
            content: <VersionItem title="v0.3" description="First draft!" createdAt="il y a une semaine"
                                  createdByName="Roch"/>
          },
          {
            key: '0.2',
            content: <VersionItem title="v0.2" description="" createdAt="il y a deux semaines" createdByName="Margot"/>
          },
          {
            key: '0.1',
            content: <VersionItem title="v0.1" description="" createdAt="il y a trois semaines" createdByName="Margot"/>
          }
        ]}></Timeline>
      </div>
      <div className={styles.bg}>
        <div className={styles.container}>
          <CollaborativeEditorArticleHeader articleId={articleId}/>
          <CollaborativeTextEditor
            articleId={articleId}
            collaborativeSessionCreatorId={collaborativeSessionCreatorId}
            collaborativeSessionId={collaborativeSessionId}
            onCollaborativeSessionStateUpdated={handleCollaborativeSessionStateUpdated}
          />
          <CollaborativeEditorArticleStats/>
        </div>
        <div className={styles.spacer}></div>
      </div>
    </>)
}
