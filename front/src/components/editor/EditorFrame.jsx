import clsx from 'clsx'
import React, { useState } from 'react'
import CollaborativeEditorArticleHeader from '../collaborative/CollaborativeEditorArticleHeader.jsx'
import CollaborativeEditorArticleStats from '../collaborative/CollaborativeEditorArticleStats.jsx'
import CollaborativeTextEditor from '../collaborative/CollaborativeTextEditor.jsx'

import styles from './EditorFrame.module.scss'

export default function EditorFrame() {

  const [drawerActive, setDrawerActive] = useState(false)
  return (
    <>
      <main className={styles.main}>
        <div className={clsx(styles.container, drawerActive && styles.active)}>
          <CollaborativeEditorArticleHeader articleId="6472441bc819ef1da4a11e70" onDrawer={(opened) => setDrawerActive(opened)}/>
          <CollaborativeTextEditor collaborativeSessionId="456"/>
          <CollaborativeEditorArticleStats/>
        </div>
      </main>
    </>
  )
}
