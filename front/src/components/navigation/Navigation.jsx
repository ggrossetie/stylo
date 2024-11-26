import React, { useCallback, useMemo } from 'react'
import { ArrowLeft, ArrowUpRight, ChevronRight } from 'react-feather'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'

import styles from './navigation.module.scss'

export default function Navigation ({ items }) {
  const activeMenuArticlePreferencesKey = 'activeMenu' 
  const activeMenuKey = useSelector(state => state.articlePreferences[activeMenuArticlePreferencesKey])
  const dispatch = useDispatch()
  const setActiveMenu = useCallback((value) => {
    console.log('dispatch', value)
    dispatch({ type: 'ARTICLE_PREFERENCES_TOGGLE', key: activeMenuArticlePreferencesKey, value })
  }, [])

  const item = useMemo(() => items?.find(i => i.key === activeMenuKey), [activeMenuKey, items])
  return <>
    <header>
      {item !== undefined && <h4 className={styles.title}
                                 onClick={() => setActiveMenu('')}>
        <ArrowLeft/> {item.title}
      </h4>}
    </header>
    <section>
      {item === undefined && <ul className={styles.items}>
        {items?.map(item => <li key={item.key} onClick={() => {
          if (item.onClick) {
            item.onClick()
          } else if (item.href) {
            window.open(item.href)
          } else {
            setActiveMenu(item.key)
          }
        }}>
          <h4 className={styles.title}>{item.title} {item.href || item.onClick ? <ArrowUpRight/> : <ChevronRight/>}</h4>
        </li>)}
      </ul>
      }
      {item !== undefined && <div className={styles.content}>{item?.content}</div>}
    </section>
  </>
}

Navigation.propTypes = {
  items: PropTypes.array.isRequired,
}
