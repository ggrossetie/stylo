import { Toggle } from '@geist-ui/core'
import { ArrowLeft } from 'lucide-react'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useEditableArticle } from '../../hooks/article.js'

import { useModal } from '../../hooks/modal.js'

import Button from '../Button'
import Modal from '../Modal'
import Alert from '../molecules/Alert.jsx'
import Loading from '../molecules/Loading.jsx'

import styles from './biblio.module.scss'
import RawBibtexPanel from './bibliographe/RawBibtexPanel.jsx'
import ZoteroPanel from './bibliographe/ZoteroPanel.jsx'
import BibliographyReferenceList from './BibliographyReferenceList.jsx'
import menuStyles from './menu.module.scss'

/**
 *
 * @param showTitle
 * @param onBack
 * @param article
 * @param versionId
 * @param readOnly
 * @return {Element}
 * @constructor
 */
function Bibliography({ showTitle, onBack, article, versionId, readOnly }) {
  const modal = useModal()
  const { dispatch } = useDispatch()
  const { t } = useTranslation()
  const [selector, setSelector] = useState('')

  const { bibliography, isLoading, updateBibliography, error } =
    useEditableArticle({
      articleId: article._id,
      versionId,
    })

  const onChange = useCallback(async (bib) => {
    await updateBibliography(bib)
  }, [])

  if (isLoading) {
    return <Loading />
  }

  if (error) {
    return <Alert message={error.message} />
  }

  const title = onBack ? (
    <h2
      className={styles.title}
      onClick={onBack}
      style={{ cursor: 'pointer', userSelect: 'none' }}
    >
      <span onClick={onBack} style={{ display: 'flex' }}>
        <ArrowLeft style={{ strokeWidth: 3 }} />
      </span>
      <span>{t('bibliography.title')}</span>
    </h2>
  ) : (
    <h2 className={styles.title}>{t('bibliography.title')}</h2>
  )

  return (
    <section className={[menuStyles.section, styles.section].join(' ')}>
      {showTitle && title}
      <Button
        className={styles.headingAction}
        small={true}
        disabled={readOnly}
        onClick={(event) => {
          event.stopPropagation()
          event.preventDefault()
          modal.show()
        }}
      >
        Importer à partir de Zotero
      </Button>

      <div
        className={styles.toggle}
        onClick={() => setSelector(selector === 'raw' ? 'basic' : 'raw')}
      >
        <Toggle
          id="raw-mode"
          checked={selector === 'raw'}
          title={t('bibliography.showBibTeX')}
          onChange={(e) => setSelector(e.target.checked ? 'raw' : 'basic')}
        />
        <label htmlFor="raw-mode">BibTeX</label>
      </div>

      {selector !== 'raw' && (
        <BibliographyReferenceList bibliography={bibliography} />
      )}
      {selector === 'raw' && (
        <RawBibtexPanel
          onChange={onChange}
          initialValue={bibliography.bibtext}
        />
      )}

      <Modal {...modal.bindings} title={'Importer à partir de Zotero'}>
        <ZoteroPanel
          articleId={article._id}
          onChange={onChange}
          zoteroLink={article.zoteroLink}
        />
      </Modal>
    </section>
  )
}

export default Bibliography
