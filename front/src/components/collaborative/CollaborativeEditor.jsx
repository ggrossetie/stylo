import React, { useState } from 'react'
import { useParams } from 'react-router-dom'

import ArticleStats from '../ArticleStats.jsx'

import styles from './CollaborativeEditor.module.scss'
import CollaborativeEditorArticleHeader from './CollaborativeEditorArticleHeader.jsx'
import CollaborativeEditorMenu from './CollaborativeEditorMenu.jsx'
import CollaborativeTextEditor from './CollaborativeTextEditor.jsx'

export default function CollaborativeEditor() {
  const { articleId, compareTo, versionId } = useParams()
  const [preview, setPreview] = useState(false)

  return (
    <section className={styles.container}>
      <div className={styles.main} role="main">
        <CollaborativeEditorArticleHeader
          articleId={articleId}
          versionId={versionId}
          onUpdate={({ mode }) => {
            setPreview(mode === 'preview')
          }}
        />
        <CollaborativeTextEditor
          articleId={articleId}
          versionId={versionId}
          preview={preview}
        />
        {!preview && <ArticleStats />}
      </div>
      <CollaborativeEditorMenu
        articleId={articleId}
        versionId={versionId}
        compareTo={compareTo}
      />
    </section>
  )
}
