import { useTranslation } from 'react-i18next'
import { Modal as GeistModal } from '@geist-ui/core'
import React from 'react'
import TagForm from './TagForm.jsx'

export default function TagCreateModal({
  initialValues,
  visible,
  setVisible,
  bindings,
}) {
  const { t } = useTranslation()
  return (
    <GeistModal width="40rem" visible={visible} {...bindings}>
      <h2>{t('tag.createForm.title')}</h2>
      <GeistModal.Content>
        <TagForm initialValues={initialValues} />
      </GeistModal.Content>
      <GeistModal.Action passive onClick={() => setVisible(false)}>
        {t('modal.close.text')}
      </GeistModal.Action>
    </GeistModal>
  )
}
