import React from 'react'
import { Modal as GeistModal, useModal } from '@geist-ui/core'
import { Printer } from 'react-feather'
import { useTranslation } from 'react-i18next'
import Button from '../../Button.jsx'
import Export from '../../Export.jsx'

export default function ArticleExportButton ({ articleVersionId, articleId, bibPreview, articleTitle }) {
  const { t } = useTranslation()

  const {
    visible,
    setVisible,
    bindings
  } = useModal()

  return <>
    <Button icon title={t('write.title.buttonExport')} onClick={() => setVisible(true)}>
      <Printer/> Export
    </Button>
    <GeistModal width="40rem" visible={visible} {...bindings}>
      <h2>{t('article.export.title')}</h2>
      <GeistModal.Content>
        <Export
          articleVersionId={articleVersionId}
          articleId={articleId}
          bib={bibPreview}
          name={articleTitle}
        />
      </GeistModal.Content>
    </GeistModal>
  </>
}
