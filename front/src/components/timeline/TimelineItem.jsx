import clsx from 'clsx'
import React from 'react'
import PropTypes from 'prop-types'

import styles from './TimelineItem.module.scss'

export default function TimelineItem({content, state = 'active'}) {
  return (<div className={clsx(styles.container, state === 'active' && styles.active)}>
    <div className={styles.bullet}></div>
    <>{content}</>
  </div>)
}

TimelineItem.propTypes = {
  content: PropTypes.element,
  state: PropTypes.string
}
