import React from 'react'
import styles from './button.module.scss'

const SimpleSelect = (props) => {
  return (
    <div className={styles.selectContainer}>
      <select className={props.className || styles.select} {...props}>
        {props.children}
      </select>
    </div>
  )
}

SimpleSelect.displayName = 'SimpleSelect'

export default SimpleSelect
