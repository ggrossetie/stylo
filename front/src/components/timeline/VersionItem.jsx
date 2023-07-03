import PropTypes from 'prop-types'
import React from 'react'
import { Eye, GitMerge, Printer } from 'react-feather'

import styles from './VersionItem.module.scss'


export default function VersionItem({ title, description, createdAt, createdByName }) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>{title}</div>
        <div className={styles.description}>{description}</div>
      </div>
      <div className={styles.footer}>
        <div className={styles.createdBy}><span className={styles.by}>by</span>&nbsp;<span className={styles.name}>{createdByName}</span>{' '}</div>
        <div className={styles.createdAt}>{createdAt}</div>
      </div>
      <div className={styles.actions}>
        <Eye></Eye>
        <Printer></Printer>
        <GitMerge/>
      </div>
    </div>
  )
}


VersionItem.propTypes = {
  description: PropTypes.string,
  createdAt: PropTypes.string,
  createdByName: PropTypes.string
}
