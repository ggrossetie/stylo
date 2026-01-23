import clsx from 'clsx'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useDisplayName } from '../../../hooks/user.js'
import { Avatar, Button, Icon } from '../../atoms/index.js'

import styles from './UserCard.module.scss'

export default function UserCard({
  user,
  variant = 'default',
  muted = false,
  disabled = false,
  active,
  selected,
  selectable = false,
  activatable = false,
  selectedIcon = 'CheckSquare',
  unselectedIcon = 'Square',
  onUserUpdated = () => {},
  className,
  'data-testid': testId,
}) {
  const [activeState, setActiveState] = useState(false)
  const [selectedState, setSelectedState] = useState(false)
  const { t } = useTranslation()
  const displayName = useDisplayName()

  useEffect(() => {
    setActiveState(active)
  }, [active])

  useEffect(() => {
    setSelectedState(selected)
  }, [selected])

  const handleSelect = useCallback(
    (user) => {
      const value = !selectedState
      setSelectedState(value)
      onUserUpdated({ user, action: value ? 'select' : 'unselect' })
    },
    [selectedState, onUserUpdated]
  )

  const handleActive = useCallback(
    (user) => {
      const value = !activeState
      setActiveState(value)
      onUserUpdated({ user, action: value ? 'active' : 'inactive' })
    },
    [activeState, onUserUpdated]
  )

  const userDisplayName = displayName(user)

  return (
    <div
      className={clsx(
        styles.userCard,
        styles[variant],
        {
          [styles.muted]: muted,
          [styles.disabled]: disabled,
        },
        className
      )}
      data-testid={testId}
    >
      <div className={styles.userInfo}>
        <Avatar user={user} size="small" />
        <div className={styles.userDetails}>
          <div className={styles.userName}>{userDisplayName}</div>
          <div className={styles.userEmail}>{user.email}</div>
        </div>
      </div>

      <div className={styles.actions}>
        {selectable && (
          <Button
            icon
            tertiary
            disabled={disabled}
            onClick={() => handleSelect(user)}
            title={selectedState ? t('unselect') : t('select')}
          >
            <Icon name={selectedState ? selectedIcon : unselectedIcon} size={16} />
          </Button>
        )}

        {activatable && (
          <Button
            icon
            tertiary
            disabled={disabled}
            onClick={() => handleActive(user)}
            title={activeState ? t('deactivate') : t('activate')}
          >
            <Icon name={activeState ? 'UserCheck' : 'User'} size={16} />
          </Button>
        )}
      </div>
    </div>
  )
}