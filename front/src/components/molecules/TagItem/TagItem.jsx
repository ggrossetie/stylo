import clsx from 'clsx'
import React from 'react'

import { Badge, Button, Checkbox, Icon } from '../../atoms/index.js'

import styles from './TagItem.module.scss'

export default function TagItem({
  tag,
  variant = 'default',
  selected,
  selectable = false,
  removable = false,
  editable = false,
  onClick,
  onRemove,
  onEdit,
  disableAction = false,
  children,
  className,
  'data-testid': testId,
  ...props
}) {
  const isSelected = tag.selected || selected
  const backgroundColor = tag.color || '#6c757d'

  if (variant === 'badge') {
    return (
      <Badge
        color={backgroundColor}
        className={clsx(styles.tagBadge, className)}
        data-testid={testId}
        {...props}
      >
        {tag.name}
        {removable && (
          <Button
            icon
            tertiary
            className={styles.removeButton}
            onClick={(e) => {
              e.stopPropagation()
              onRemove?.(tag)
            }}
          >
            <Icon name="X" size={12} />
          </Button>
        )}
      </Badge>
    )
  }

  return (
    <div
      className={clsx(
        styles.tagItem,
        {
          [styles.selected]: isSelected,
          [styles.interactive]: selectable || onClick,
        },
        className
      )}
      data-testid={testId}
    >
      <label className={styles.label}>
        {selectable && !disableAction && (
          <Checkbox
            checked={isSelected}
            onChange={onClick}
            value={tag._id}
            data-id={tag._id}
            className={styles.checkbox}
          />
        )}
        <span className={styles.name}>{tag.name}</span>
        <span
          className={styles.colorChip}
          style={{ backgroundColor }}
          aria-hidden
        />
        {children}
      </label>

      {(removable || editable) && (
        <div className={styles.actions}>
          {editable && (
            <Button
              icon
              tertiary
              onClick={() => onEdit?.(tag)}
              title="Éditer"
            >
              <Icon name="Edit" size={14} />
            </Button>
          )}
          {removable && (
            <Button
              icon
              tertiary
              onClick={() => onRemove?.(tag)}
              title="Supprimer"
            >
              <Icon name="Trash2" size={14} />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}