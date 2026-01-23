import clsx from 'clsx'
import React from 'react'

import styles from './Badge.module.scss'

export default function Badge({
  children,
  variant = 'default',
  size = 'medium',
  color,
  className,
  'data-testid': testId,
  ...props
}) {
  return (
    <span
      className={clsx(
        styles.badge,
        styles[variant],
        styles[size],
        className
      )}
      style={color ? { backgroundColor: color } : undefined}
      data-testid={testId}
      {...props}
    >
      {children}
    </span>
  )
}