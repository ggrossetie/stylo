import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Loading } from '@geist-ui/core'

import { useActiveUser } from '../hooks/user.js'

import Alert from './molecules/Alert.jsx'

import styles from '../layout.module.scss'
import buttonStyles from './button.module.scss'

export default function RegisterLoginActions() {
  const { t } = useTranslation()
  const { userId, isLoading, error } = useActiveUser()

  if (isLoading) {
    return <Loading />
  }

  if (error) {
    return <Alert message={error.message} />
  }

  if (userId) {
    return <></>
  }

  return (
    <p className={styles.horizontalActions}>
      <Link to="/register" className={buttonStyles.linkPrimary}>
        {t('credentials.login.registerLink')}
      </Link>

      <Link to="/login" className={buttonStyles.linkSecondary}>
        {t('credentials.login.confirmButton')}
      </Link>
    </p>
  )
}
