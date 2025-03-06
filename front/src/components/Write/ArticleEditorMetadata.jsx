import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Sidebar } from 'react-feather'

import ArticleMetadata from './ArticleMetadata.jsx'

import styles from './articleEditorMetadata.module.scss'

/**
 * @param {object} props properties
 * @param {any} props.metadata
 * @param {boolean} props.readOnly
 * @returns {Element}
 */
export default function ArticleEditorMetadata({
  readOnly,
  metadata,
  articleId,
}) {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const expanded = useSelector(
    (state) => state.articlePreferences.expandSidebarRight
  )
  const toggleExpand = useCallback(
    () =>
      dispatch({
        type: 'ARTICLE_PREFERENCES_TOGGLE',
        key: 'expandSidebarRight',
      }),
    []
  )
  return (
    <nav className={`${expanded ? styles.expandRight : styles.retractRight}`}>
      <button
        onClick={toggleExpand}
        className={expanded ? styles.close : styles.open}
      >
        <Sidebar />
        {expanded
          ? t('write.sidebar.closeButton')
          : t('write.sidebar.metadataButton')}
      </button>
      {expanded && (
        <ArticleMetadata
          metadata={metadata}
          readOnly={readOnly}
          articleId={articleId}
        />
      )}
    </nav>
  )
}
