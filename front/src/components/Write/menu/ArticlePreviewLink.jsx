import React from 'react'
import { Eye } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import buttonStyles from '../../button.module.scss'

export default function ArticlePreviewLink ({ version, articleId }) {
  const { t } = useTranslation()
  const previewUrl = version
    ? `/article/${articleId}/version/${version}/preview`
    : `/article/${articleId}/preview`

  return <Link to={previewUrl}
               title={t('write.title.buttonPreview')}
               target="_blank"
               rel="noopener noreferrer"
               className={buttonStyles.icon}>
    <Eye/> Preview
  </Link>
}
