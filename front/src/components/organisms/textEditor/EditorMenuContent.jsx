import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { useRouteLoaderData } from 'react-router'

import ArticleBibliography from '../bibliography/ArticleBibliography.jsx'
import Export from '../export/Export.jsx'
import ArticleMetadata from '../metadata/ArticleMetadata.jsx'
import ArticleData from '../nakala/ArticleData.jsx'
import ArticleTableOfContents from './ArticleTableOfContents.jsx'
import CollaborativeVersions from './CollaborativeVersions.jsx'
import styles from './EditorMenu.module.scss'
import EditorValidation from './EditorValidation.jsx'

export default function EditorMenuContent({
  articleId,
  versionId,
  activeMenu,
  validationDiagnostics = [],
  isValidating = false,
  hasValidated = false,
  enabledProfiles = [],
  onProfileToggle,
  onNavigateToDiagnostic,
  onClose,
  onFocusMenu,
  onFocusEditor,
  panelRef,
  validationPanelRef,
}) {
  const { article } = useRouteLoaderData('article')
  const { t } = useTranslation()

  if (!activeMenu) {
    return null
  }

  const handleKeyDown = (event) => {
    // defaultPrevented: let nested widgets (comboboxes, dropdowns) consume keys first
    if (event.defaultPrevented) return

    if (event.key === 'Escape') {
      event.preventDefault()
      onClose?.()
      return
    }

    // Don't hijack caret movement in form fields
    if (
      event.target.matches?.(
        'input, textarea, select, [contenteditable="true"]'
      )
    ) {
      return
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      onFocusEditor?.()
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      onFocusMenu?.()
    }
  }

  return (
    <div
      ref={panelRef}
      role="region"
      aria-label={t(`${activeMenu}.title`)}
      tabIndex={-1}
      className={clsx(styles.content, styles.active)}
      onKeyDown={handleKeyDown}
    >
      {activeMenu === 'metadata' && (
        <ArticleMetadata articleId={articleId} versionId={versionId} />
      )}
      {activeMenu === 'toc' && <ArticleTableOfContents />}
      {activeMenu === 'bibliography' && (
        <ArticleBibliography articleId={articleId} />
      )}
      {activeMenu === 'data' && <ArticleData articleId={articleId} />}
      {activeMenu === 'export' && (
        <>
          <h2 style={{ cursor: 'pointer', userSelect: 'none' }}>
            <span>{t('export.title')}</span>
          </h2>
          <Export
            articleId={articleId}
            name={article?.title}
            bib={article?.workingVersion?.bibPreview}
          />
        </>
      )}
      {activeMenu === 'versions' && (
        <CollaborativeVersions
          articleId={articleId}
          selectedVersion={versionId}
          showTitle={true}
        />
      )}
      {activeMenu === 'validation' && (
        <EditorValidation
          ref={validationPanelRef}
          diagnostics={validationDiagnostics}
          isValidating={isValidating}
          hasValidated={hasValidated}
          enabledProfiles={enabledProfiles}
          onProfileToggle={onProfileToggle}
          onNavigate={onNavigateToDiagnostic}
        />
      )}
    </div>
  )
}
