import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Button from '../Button.jsx'
import buttonStyles from '../button.module.scss'
import Export from '../Export.jsx'
import Modal from '../Modal.jsx'

import styles from './articleEditorMenu.module.scss'
import Biblio from './Biblio'
import ArticleExportButton from './menu/ArticleExportButton.jsx'
import ArticlePreviewLink from './menu/ArticlePreviewLink.jsx'
import Sommaire from './menu/Sommaire.jsx'
import Versions from './menu/Versions.jsx'
import { Edit3, Eye, Printer, Sidebar } from 'react-feather'

export default function ArticleEditorMenu ({ articleInfos, readOnly, compareTo, selectedVersion }) {
  const previewUrl = selectedVersion
    ? `/article/${articleInfos._id}/version/${selectedVersion}/preview`
    : `/article/${articleInfos._id}/preview`
  const expanded = useSelector(state => state.articlePreferences.expandSidebarLeft)
  const dispatch = useDispatch()
  const toggleExpand = useCallback(() => dispatch({ type: 'ARTICLE_PREFERENCES_TOGGLE', key: 'expandSidebarLeft' }), [])
  const { t } = useTranslation()

  return (
    <nav className={`${expanded ? styles.expandleft : styles.retractleft}`}>
      <button onClick={toggleExpand} className={expanded ? styles.close : styles.open}>
        <Sidebar/> {expanded ? t('write.sidebar.closeButton') : t('write.sidebar.biblioAndCoButton')}
      </button>
      {expanded && (<div>
        <Versions
          article={articleInfos}
          selectedVersion={selectedVersion}
          compareTo={compareTo}
          readOnly={readOnly}
        />
        <Sommaire/>
        <Biblio readOnly={readOnly} article={articleInfos}/>
        <ArticleExportButton 
          articleId={articleInfos._id}
          bibPreview={'TODO: BIB Preview'}
          articleVersionId={selectedVersion}
          articleTitle={articleInfos.title}
        ></ArticleExportButton>
        <ArticlePreviewLink articleId={articleInfos._id} version={selectedVersion}></ArticlePreviewLink>
      </div>)}
    </nav>
  )
}
