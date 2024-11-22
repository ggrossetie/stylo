import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouteMatch } from 'react-router-dom'
import { usePandocAnchoring } from '../../../hooks/pandoc.js'

import styles from './sommaire.module.scss'

export default function TableOfContents () {
  const articleStructure = useSelector(state => state.articleStructure)
  const dispatch = useDispatch()
  const routeMatch = useRouteMatch()
  const getAnchor = usePandocAnchoring()
  const hasHtmlAnchors = routeMatch.path === '/article/:id/preview'
  const handleTableEntryClick = useCallback(({ target }) => {
    hasHtmlAnchors
      ? document.querySelector(`#${target.dataset.headingAnchor}`)?.scrollIntoView()
      : dispatch({ type: 'UPDATE_EDITOR_CURSOR_POSITION', lineNumber: parseInt(target.dataset.index, 10), column: 0 })
  }, [hasHtmlAnchors])

  return (<section>
      <ul>
        {articleStructure.map((item) => (
          <li
            className={styles.headlineItem}
            key={`line-${item.index}-${item.line}`}
            role="button"
            tabIndex={0}
            data-index={item.index}
            data-heading-anchor={getAnchor(item.line)}
            onClick={handleTableEntryClick}
          >
            {item.title}
          </li>
        ))}
      </ul>
    </section>
  )
}
