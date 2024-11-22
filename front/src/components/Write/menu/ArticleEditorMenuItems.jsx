import React, { createContext, useContext } from 'react'
import ArticleEditorMenuItem from './ArticleEditorMenuItem.jsx'
import TableOfContents from './TableOfContents.jsx'
import { useMenuItem } from './useMenuItem.js'

const MenuContext = createContext('light')

export default function ArticleEditorMenuItems ({ initialValue }) {
  const { activeIndex, toggle } = useMenuItem()
  const theme = useContext(MenuContext)
  return <MenuContext.Provider value={initialValue}>
    <div>
      <ArticleEditorMenuItem title={'Tables des matières'} index={1}>
        <TableOfContents/>
      </ArticleEditorMenuItem>
      <ArticleEditorMenuItem title={'Bibliographie'} index={2}>
        <TableOfContents/>
      </ArticleEditorMenuItem>
      <ArticleEditorMenuItem title={'Versions'} index={3}>
        <TableOfContents/>
      </ArticleEditorMenuItem>
    </div>
  </MenuContext.Provider>
}
