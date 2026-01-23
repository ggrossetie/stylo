import clsx from 'clsx'
import * as LucideIcons from 'lucide-react'
import React from 'react'

import styles from './Icon.module.scss'

export default function Icon({
  name,
  size = 16,
  color,
  className,
  title,
  'aria-label': ariaLabel,
  'data-testid': testId,
  ...props
}) {
  const IconComponent = LucideIcons[name]

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in lucide-react`)
    return null
  }

  return (
    <IconComponent
      size={size}
      color={color}
      className={clsx(styles.icon, className)}
      title={title}
      aria-label={ariaLabel || title}
      data-testid={testId}
      {...props}
    />
  )
}