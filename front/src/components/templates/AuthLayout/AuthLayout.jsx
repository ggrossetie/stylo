import React from 'react'
import { Link } from 'react-router'

import logoContent from '/images/logo.svg?inline'

import styles from './AuthLayout.module.scss'

export default function AuthLayout({ 
  children, 
  title, 
  subtitle,
  showLogo = true 
}) {
  return (
    <div className={styles.authLayout}>
      <div className={styles.authContainer}>
        {showLogo && (
          <div className={styles.header}>
            <Link to="/" className={styles.logo}>
              <div
                className={styles.logoSvg}
                dangerouslySetInnerHTML={{ __html: logoContent }}
              />
              <span className={styles.title}>Stylo</span>
            </Link>
          </div>
        )}

        <div className={styles.authContent}>
          {title && <h1 className={styles.authTitle}>{title}</h1>}
          {subtitle && <p className={styles.authSubtitle}>{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  )
}