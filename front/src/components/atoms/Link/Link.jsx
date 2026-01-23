import clsx from 'clsx'
import React from 'react'
import { Link as RouterLink } from 'react-router'

import styles from './Link.module.scss'

export default function Link({
  to,
  href,
  children,
  variant = 'default',
  external = false,
  className,
  'data-testid': testId,
  ...props
}) {
  const classNames = clsx(styles.link, styles[variant], className)

  if (external || href) {
    return (
      <a
        href={href || to}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className={classNames}
        data-testid={testId}
        {...props}
      >
        {children}
      </a>
    )
  }

  return (
    <RouterLink
      to={to}
      className={classNames}
      data-testid={testId}
      {...props}
    >
      {children}
    </RouterLink>
  )
}