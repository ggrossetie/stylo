import clsx from 'clsx'
import React from 'react'
import styles from './tag.module.scss'
import Button from '../Button.jsx'
import { Settings } from 'react-feather'
import TagCreateModal from './TagCreateModal.jsx'
import { useModal } from '@geist-ui/core'

export default function ArticleTag({
  tag,
  selected,
  key,
  onClick,
  disableAction,
}) {
  const formModal = useModal()
  const isSelected = tag.selected || selected
  const classNames = clsx(styles.tag, isSelected && styles.selected)
  const backgroundColor = tag.color || 'grey'
  return (
    <>
      <label className={classNames}>
        <span className={styles.content}>
          {!disableAction && (
            <input
              name={key}
              value={tag._id}
              data-id={tag._id}
              type="checkbox"
              checked={isSelected}
              onChange={onClick}
            />
          )}
          {tag.name}
          <span className={styles.chip} style={{ backgroundColor }} />
        </span>

        <Button
          className={styles.editButton}
          icon={true}
          onClick={() => formModal.setVisible(true)}
        >
          <Settings size="16" />
        </Button>
      </label>

      <TagCreateModal
        {...formModal}
        initialValues={{
          name: tag.name,
          id: tag._id,
          color: tag.color,
          description: tag.description,
        }}
      />
    </>
  )
}
