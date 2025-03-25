import clsx from 'clsx'
import { CalendarClock, CircleSmall, MapPin } from 'lucide-react'
import React from 'react'
import { User } from 'react-feather'
import { Link } from 'react-router-dom'
import buttonStyles from '../button.module.scss'

import styles from './Version.module.scss'

export default function Version({
  state,
  icon,
  avatar,
  version,
  title,
  description,
}) {
  const canCompare = state !== 'compare-from' && state !== 'compare-to'
  return (
    <div className={styles.container}>
      <div
        className={clsx(
          styles.version,
          state === 'compare-to' && styles.compareTo,
          state === 'compare-from' && styles.compareFrom
        )}
      >
        <div className={styles.content}>
          <div className={styles.name}>v{version}</div>
        </div>
        {title && (
          <div className={styles.info}>
            <span className={styles.title}>{title}</span>
            {description && (
              <span className={styles.description}>{description}</span>
            )}
          </div>
        )}
        {state === 'compare-to' && (
          <div className={styles.addon}>
            base <CircleSmall strokeWidth={2.5} />
          </div>
        )}
        {state === 'compare-from' && (
          <div className={styles.addon}>
            stop <MapPin strokeWidth={2.5} />
          </div>
        )}
        {canCompare && (
          <div className={styles.actions}>
            <Link
              className={clsx(
                buttonStyles.button,
                buttonStyles.secondary,
                styles.action
              )}
            >
              comparer
            </Link>
          </div>
        )}
      </div>
      <div className={styles.footer}>
        <div className={styles.date}>
          <CalendarClock width={'1rem'} height={'1rem'} /> il y a 4 heures
        </div>
        <div className={styles.user}>
          <User width={'1rem'} height={'1rem'} /> ggrossetie
        </div>
      </div>
    </div>
  )
}
