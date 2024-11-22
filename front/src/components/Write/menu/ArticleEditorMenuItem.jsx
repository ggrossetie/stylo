import React, { useMemo } from 'react'
import { ArrowLeft, ChevronRight } from 'react-feather'

import styles from './articleEditorMenuItem.module.scss'
import { useMenuItem } from './useMenuItem.js'

export default function ArticleEditorMenuItem({ title, children, index, value }) {
  const {activeIndex, toggle} = useMenuItem()
  
  return <div>
    <h4 className={styles.title} onClick={() => toggle(value)}>
      {active && <ArrowLeft/>} {title} {!active && <ChevronRight/>}
    </h4>
    {active && <div>{children}</div>}
  </div>
}
