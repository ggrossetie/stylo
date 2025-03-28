import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { ChevronRight, ChevronDown } from 'lucide-react'

import { useModal } from '../../hooks/modal.js'

import Bibliography from './Bibliography.jsx'

import styles from './biblio.module.scss'
import menuStyles from './menu.module.scss'

/**
 * @param article
 * @param versionId
 * @param readOnly
 * @return {Element}
 * @constructor
 */
export default function ArticleBibliography({ article, versionId, readOnly }) {
  const expand = useSelector((state) => state.articlePreferences.expandBiblio)
  const dispatch = useDispatch()
  const modal = useModal()
  const toggleExpand = useCallback(
    () => dispatch({ type: 'ARTICLE_PREFERENCES_TOGGLE', key: 'expandBiblio' }),
    []
  )

  const { t } = useTranslation()

  return (
    <section className={[menuStyles.section, styles.section].join(' ')}>
      <h1 onClick={toggleExpand}>
        {expand ? <ChevronDown /> : <ChevronRight />}
        {t('write.sidebar.biblioTitle')}
      </h1>
      {expand && (
        <Bibliography article={article} readOnly={readOnly} showTitle={false} />
      )}
    </section>
  )
}
