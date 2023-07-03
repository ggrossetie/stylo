import React from 'react'
import TimelineItem from './TimelineItem.jsx'
import PropTypes from 'prop-types'

import styles from './Timeline.module.scss'

export default function Timeline({items}) {
    return (
      <div className={styles.container}>
        {items.map((item) => (<TimelineItem key={item.key} {...item} />))}
      </div>
    )
}

Timeline.propTypes = {
  items: PropTypes.array,
}
