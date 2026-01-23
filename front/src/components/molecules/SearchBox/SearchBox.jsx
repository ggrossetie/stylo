import { Search, X } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { Button, Field, Icon, Input } from '../../atoms/index.js'

import styles from './SearchBox.module.scss'

export default function SearchBox({
  value = '',
  onChange,
  onClear,
  placeholder,
  disabled = false,
  autoFocus = false,
  className,
  'data-testid': testId,
  ...props
}) {
  const { t } = useTranslation()

  return (
    <div className={`${styles.searchBox} ${className || ''}`} data-testid={testId}>
      <div className={styles.inputWrapper}>
        <Icon name="Search" className={styles.searchIcon} size={16} />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder || t('search.placeholder')}
          disabled={disabled}
          autoFocus={autoFocus}
          className={styles.input}
          {...props}
        />
        {value && (
          <Button
            icon
            tertiary
            onClick={() => {
              onChange?.('')
              onClear?.()
            }}
            className={styles.clearButton}
            title={t('search.clear')}
            aria-label={t('search.clear')}
          >
            <Icon name="X" size={14} />
          </Button>
        )}
      </div>
    </div>
  )
}