import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { shallowEqual, useSelector } from 'react-redux'
import { Link } from "react-router-dom";
import { AlertCircle, AlignLeft, Check, Edit3, Eye, Loader, Printer } from 'react-feather'
import { useTranslation } from 'react-i18next'
import TimeAgo from '../TimeAgo.jsx'

import styles from './workingVersion.module.scss'
import buttonStyles from "../button.module.scss";
import Button from "../Button";
import Modal from "../Modal";
import Export from "../Export";

const ONE_MINUTE = 60000

export function ArticleVersion ({ version }) {
  const { t } = useTranslation()

  return <span>
    {!version && <span>{t('workingVersion.spanWorkingCopy.text')}</span>}
    {version && version.message && <span>
      <span className={styles.versionLabel}>{version.message}</span>
      <span className={styles.versionNumber}>v{version.major}.{version.minor}</span>
    </span>}
    {version && !version.message && <span>
      <span className={styles.versionNumber}>v{version.major}.{version.minor}</span>
    </span>}
  </span>
}

export function ArticleSaveState ({ state, updatedAt, stateMessage }) {
  const [lastRefreshedAt, setLastRefresh] = useState(Date.now())
  const { t } = useTranslation()

  const stateUiProps = {
    saved: {
      text: t('workingVersion.stateUiProps.savedText'),
      icon: <Check/>,
      style: styles.savedIndicator
    },
    saving: {
      text: t('workingVersion.stateUiProps.savingText'),
      icon: <Loader/>,
      style: styles.savingIndicator
    },
    saveFailure: {
      text: t('workingVersion.stateUiProps.saveErrorText'),
      icon: <AlertCircle/>,
      style: styles.failureIndicator
    },
  }
  const stateUi = stateUiProps[state]

  const isoString = useMemo(() => new Date(updatedAt).toISOString(), [updatedAt, lastRefreshedAt])

  useEffect(() => {
    const timer = setTimeout(() => setLastRefresh(Date.now() * 1000), ONE_MINUTE)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
    <span className={stateUi.style}>
      {state !== 'saved' && stateUi.icon}
      {state !== 'saveFailure' && stateUi.text}
      {state === 'saveFailure' && (<span>
        <strong>{stateUi.text}</strong>
        {stateMessage}
      </span>)}
    </span>

    {state === 'saved' && (<TimeAgo date={isoString}/>)}
  </>)
}

export default function WorkingVersion ({ articleInfos, live, selectedVersion, mode }) {
  const [exporting, setExporting] = useState(false)
  const workingArticle = useSelector(state => state.workingArticle, shallowEqual)
  const cancelExport = useCallback(() => setExporting(false), [])
  const openExport = useCallback(() => setExporting(true), [])
  const { t } = useTranslation()

  const articleOwnerAndContributors = [
    articleInfos.owner.displayName,
    ...articleInfos.contributors.map(contributor => contributor.user.displayName)
  ]

  return (
    <>
      <section className={styles.section}>
        <header className={styles.header}>
          <h1 className={styles.title}>{articleInfos.title}</h1>
        </header>
      </section>
      <section>
        <div className={styles.meta}>
          <ul className={styles.byLine}>
            <li className={styles.owners}>{t('workingVersion.by.text')} {articleOwnerAndContributors.join(', ')}</li>
            <li className={styles.version}>
              <ArticleVersion version={live.version}/>
            </li>
            {!live.version && <li className={styles.lastSaved}>
              <ArticleSaveState state={workingArticle.state} updatedAt={workingArticle.updatedAt} stateMessage={workingArticle.stateMessage}/>
            </li>}
          </ul>
        </div>
      </section>
    </>
  )
}
