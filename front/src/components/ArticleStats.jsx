import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { shallowEqual, useSelector } from 'react-redux'
import styles from './articleStats.module.scss'

export default function ArticleStats () {
  const { t } = useTranslation()
  const articleStats = useSelector((state) => state.articleStats, shallowEqual)
  return (
    <ul className={styles.stats} aria-label={t('article.stats.menuLabel')}>
      <li>
        <Trans i18nKey="article.stats.words" count={articleStats.wordCount}>
          <span className={styles.count}>123</span> words
        </Trans>
      </li>
      <li>
        <Trans i18nKey="article.stats.chars" count={articleStats.charCountNoSpace} values={{ countWithSpaces: articleStats.charCountPlusSpace }}>
          <span className={styles.count}>123</span> characters <span className={styles.count}>123</span> with spaces
        </Trans>
      </li>
      <li>
        <Trans i18nKey="article.stats.citations" count={articleStats.citationNb}>
          <span className={styles.count}>123</span> citations
        </Trans>
      </li>
    </ul>
  )
}
