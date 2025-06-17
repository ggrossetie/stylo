import { NotebookText } from 'lucide-react'
import React, { useCallback, useMemo } from 'react'
import { DndProvider } from 'react-dnd'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { dragAndDropManager } from '../../hooks/dnd.js'
import useFetchData from '../../hooks/graphql.js'
import { useActiveWorkspaceId } from '../../hooks/workspace.js'

import Button from '../Button.jsx'
import Alert from '../molecules/Alert.jsx'
import Loading from '../molecules/Loading.jsx'
import CorpusArticleItems from './CorpusArticleItems.jsx'

import { getCorpus } from './Corpus.graphql'

import styles from './CorpusArticles.module.scss'

export default function CorpusArticles({ corpusId }) {
  const { t } = useTranslation()
  const activeWorkspaceId = useActiveWorkspaceId()
  const { data, isLoading, mutate } = useFetchData(
    {
      query: getCorpus,
      variables: { filter: { corpusId: corpusId }, includeArticles: true },
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )
  const corpusArticles = useMemo(
    () => data?.corpus?.[0]?.articles || [],
    [data]
  )

  const handleUpdate = useCallback(() => {
    mutate()
  }, [mutate])

  return (
    <>
      {isLoading && <Loading />}
      {!isLoading && (
        <>
          <div className={styles.heading}>
            <Button secondary>Associer un article</Button>
            <h5 className={styles.partsTitle}>
              Articles
              <span className={styles.count}>{corpusArticles.length}</span>
            </h5>
          </div>
          {corpusArticles.length > 0 && (
            <ul>
              <DndProvider manager={dragAndDropManager}>
                <CorpusArticleItems
                  corpusId={corpusId}
                  articles={corpusArticles}
                  onUpdate={handleUpdate}
                />
              </DndProvider>
            </ul>
          )}
        </>
      )}
    </>
  )
}
