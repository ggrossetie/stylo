import { useInput } from '@geist-ui/core'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import styles from './TagCreate.module.scss'
import Field from '../Field.jsx'
import { randomColor } from '../../helpers/colors.js'
import Button from '../Button.jsx'
import { Trash2 } from 'react-feather'
import { clsx } from 'clsx'

export default function TagForm({ initialValues, onSubmit }) {
  const { t } = useTranslation()
  const { state: name, bindings: nameBindings } = useInput(
    initialValues?.name ?? ''
  )
  const { state: description, bindings: descriptionBindings } = useInput(
    initialValues?.description ?? ''
  )
  const { state: color, bindings: colorBindings } = useInput(
    initialValues?.color ?? randomColor()
  )

  const updateMode = initialValues !== undefined
  const data = {
    name,
    description,
    color,
  }

  const handleSubmit = useCallback(() => onSubmit(data), [onSubmit, data])

  return (
    <section className={styles.create}>
      <form onSubmit={handleSubmit}>
        <Field
          autoFocus={true}
          label={t('tag.createForm.nameField')}
          type="text"
          {...nameBindings}
        />
        <Field
          label={t('tag.createForm.descriptionField')}
          type="text"
          {...descriptionBindings}
        />
        <Field
          label={t('tag.createForm.colorField')}
          type="color"
          {...colorBindings}
        />
        <ul
          className={clsx(
            styles.actions,
            updateMode ? styles.updateActions : styles.createActions
          )}
        >
          {!updateMode && (
            <li>
              <Button primary={true} title={t('tag.createForm.buttonTitle')}>
                {t('tag.createForm.buttonText')}
              </Button>
            </li>
          )}

          {updateMode && (
            <>
              <li>
                <Button
                  link={true}
                  title="Delete"
                  className={styles.deleteButton}
                >
                  <Trash2 />
                  Supprimer
                </Button>
              </li>
              <li>
                <Button secondary={true} title="Cancel">
                  Fermer
                </Button>
                <Button primary={true} title="Update">
                  Mettre à jour
                </Button>
              </li>
            </>
          )}
        </ul>
      </form>
    </section>
  )
}
