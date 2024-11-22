import { Modal as GeistModal, useModal } from '@geist-ui/core'
import clsx from 'clsx'
import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import Export from '../Export.jsx'
import Navigation from '../navigation/Navigation.jsx'

import styles from './articleEditorMenu.module.scss'
import ArticleEditorMetadata from './ArticleEditorMetadata.jsx'
import Bibliography from './Bibliography.jsx'
import TableOfContents from './menu/TableOfContents.jsx'
import Versions from './menu/Versions.jsx'
import { Sidebar, XSquare } from 'react-feather'

export default function ArticleEditorMenu ({ articleInfos, readOnly, compareTo, selectedVersion, yaml, handleYaml }) {
  const previewUrl = selectedVersion
    ? `/article/${articleInfos._id}/version/${selectedVersion}/preview`
    : `/article/${articleInfos._id}/preview`
  const expanded = useSelector(state => state.articlePreferences.expandSidebarLeft)
  const dispatch = useDispatch()
  const toggleExpand = useCallback(() => dispatch({ type: 'ARTICLE_PREFERENCES_TOGGLE', key: 'expandSidebarLeft' }), [])
  const { t } = useTranslation()
  const {
    visible,
    setVisible,
    bindings
  } = useModal()
  return (
    <nav className={styles.menu}>
      <button onClick={toggleExpand}>
        {expanded ? <XSquare/> : <Sidebar/>} {expanded ? t('write.sidebar.closeButton') : t('write.sidebar.menu')}
      </button>
      {expanded && (<div>
        <Navigation items={[
          {
            key: 'toc',
            title: t('write.titleToc.sidebar'),
            content: <TableOfContents/>
          },
          {
            key: 'bibliography',
            title: t('write.sidebar.biblioTitle'),
            content: <Bibliography readOnly={readOnly} article={articleInfos}/>
          },
          {
            key: 'versions',
            title: t('write.titleVersion.sidebar'),
            content: <Versions
              article={articleInfos}
              selectedVersion={selectedVersion}
              compareTo={compareTo}
              readOnly={readOnly}
            />
          },
          {
            key: 'metadata',
            title: 'Métadonnées',
            content: <ArticleEditorMetadata readOnly={readOnly} article={articleInfos} yaml={yaml} handleYaml={handleYaml}/>
          },
          {
            key: 'export',
            title: 'Export',
            onClick: () => {
              setVisible(true)
            }
          },
          {
            key: 'preview',
            title: 'Preview',
            href: previewUrl
          }
        ]}/>
        <GeistModal width="40rem" visible={visible} {...bindings}>
          <h2>{t('article.export.title')}</h2>
          <GeistModal.Content>
            <Export
              articleVersionId={selectedVersion}
              articleId={articleInfos._id}
              bib={'TODO: BIB Preview'}
              name={articleInfos.title}
            />
          </GeistModal.Content>
        </GeistModal>
      </div>)}
    </nav>
  )
}
