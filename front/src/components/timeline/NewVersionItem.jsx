import { Button } from '@geist-ui/core'
import clsx from 'clsx'
import React from 'react'
import { PlusSquare } from 'react-feather'

import styles from './NewVersionItem.module.scss'
import buttonStyles from '../button.module.scss'


export default function NewVersionItem() {
  return (
    <div className={styles.container}>
      <div className={styles.action}><Button className={buttonStyles.button}><PlusSquare className={styles.icon}/> Create a new version</Button></div>
    </div>
  )
}


