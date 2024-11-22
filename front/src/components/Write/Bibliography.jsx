import React, { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import Modal from '../Modal'
import Bibliographe from './bibliographe/Bibliographe'

import styles from './biblio.module.scss'
import Button from '../Button'
import ReferenceList from './ReferenceList'

function Bibliography ({ article, readOnly }) {
  const [modal, setModal] = useState(false)
  const openModal = useCallback((event) => {
    event.preventDefault()
    event.stopPropagation()
    setModal(true)
  }, [])
  const closeModal = useCallback(() => setModal(false), [])
  const { t } = useTranslation()

  return (<section>
      <Button className={styles.headingAction} small={true} disabled={readOnly}
              onClick={openModal}>{t('write.sidebar.manageButton')}</Button>
      <ReferenceList/>
      {modal && (
        <Modal title={t('write.biblioModal.title')} cancel={closeModal}>
          <Bibliographe cancel={closeModal} article={article}/>
        </Modal>
      )}
    </section>
  )
}

export default Bibliography
