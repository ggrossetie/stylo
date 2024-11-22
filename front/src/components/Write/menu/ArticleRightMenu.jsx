import React from 'react'
import { ArrowUpRight, ChevronRight } from 'react-feather'
import { useTranslation } from 'react-i18next'
import ArticleEditorMenuItems from './ArticleEditorMenuItems.jsx'

export default function ArticleRightMenu(props) {
  const { t } = useTranslation()
  return (<div>
    <ArticleEditorMenuItems/>
    <ul>
      <li>{t('editor.menu.toc')} <ChevronRight/></li>
      <li>{t('editor.menu.bibliography')} <ChevronRight/></li>
      <li>{t('editor.menu.versions')} <ChevronRight/></li>
      <li>{t('editor.menu.metadata')} <ChevronRight/></li>
      <li>{t('editor.menu.export')} <ArrowUpRight/></li>
      <li>{t('editor.menu.preview')} <ArrowUpRight/></li>
    </ul>
  </div>)
}
