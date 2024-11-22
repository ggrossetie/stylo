import React, { useMemo, useState } from 'react'
import { ArrowLeft, ArrowUpRight, ChevronRight } from 'react-feather'
import PropTypes from 'prop-types'

import styles from './navigation.module.scss'

export default function Navigation ({ items }) {
  const [activeKey, setActiveKey] = useState('')
  const item = useMemo(() => items?.find(i => i.key === activeKey), [activeKey])
  return <>
    <header>
      {item !== undefined && <h4 className={styles.title}
                                 onClick={() => setActiveKey('')}><ArrowLeft/> {item.title}
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
            setActiveKey(item.key)
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
