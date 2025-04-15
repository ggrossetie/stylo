import { Eye, PencilLine } from 'lucide-react'
import React from 'react'

import useFetchData from '../../hooks/graphql.js'

import { getArticleInfo } from '../Article.graphql'

import Button from '../Button.jsx'
import Loading from '../molecules/Loading.jsx'

import styles from './CollaborativeEditorArticleHeader.module.scss'

/**
 * @param props
 * @param {string} props.articleId
 * @param {string|undefined} props.versionId
 * @param {({mode: string}) => {}} props.onUpdate
 * @return {Element}
 */
export default function CollaborativeEditorArticleHeader({
  articleId,
  versionId,
  onUpdate,
}) {
  const { data, isLoading } = useFetchData(
    { query: getArticleInfo, variables: { articleId } },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )
  if (isLoading) {
    return <Loading />
  }

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{data?.article?.title}</h1>
      {!versionId && (
        <div className={styles.actions}>
          <Button
            className={styles.action}
            small={true}
            onClick={() => onUpdate({ mode: 'edit' })}
          >
            <PencilLine /> Edition
          </Button>
          <Button
            className={styles.action}
            small={true}
            onClick={() => onUpdate({ mode: 'preview' })}
          >
            <Eye /> Aperçu
          </Button>
        </div>
      )}
    </header>
  )
}
