import React, { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'

import { Button, Icon } from '../../../atoms/index.js'

import styles from './BaseModal.module.scss'

const noop = () => {}

/**
 * BaseModal - Composant modal réutilisable
 * @param {Object} props
 * @param {string} props.title - Titre de la modal
 * @param {string} props.subtitle - Sous-titre optionnel
 * @param {React.ReactNode} props.children - Contenu de la modal
 * @param {Function} props.onClose - Fonction de fermeture
 * @param {boolean} props.visible - Visibilité de la modal
 * @param {string} props.size - Taille de la modal (small, medium, large)
 * @param {boolean} props.closable - Si la modal peut être fermée
 * @param {string} props.className - Classes CSS additionnelles
 */
export default forwardRef(function BaseModal(
  { 
    title, 
    subtitle = '', 
    children, 
    onClose = noop, 
    visible = true,
    size = 'medium',
    closable = true,
    className = '',
    'data-testid': testId,
  },
  forwardedRef
) {
  const { t } = useTranslation()

  if (!visible) return null

  return (
    <div className={styles.modalOverlay} onClick={closable ? onClose : undefined}>
      <dialog
        open={visible}
        className={`${styles.modal} ${styles[size]} ${className}`}
        ref={forwardedRef}
        onClose={closable ? onClose : undefined}
        aria-labelledby="modal-title"
        aria-describedby={subtitle ? 'modal-description' : undefined}
        data-testid={testId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.content}>
          <header className={styles.modalHeader}>
            <div className={styles.titleArea}>
              <h1 id="modal-title" className={styles.title}>
                {title}
              </h1>
              {subtitle && (
                <p id="modal-description" className={styles.subtitle}>
                  {subtitle}
                </p>
              )}
            </div>
            
            {closable && (
              <Button
                icon
                tertiary
                onClick={onClose}
                className={styles.closeButton}
                aria-label={t('modal.close.label')}
                title={t('modal.close.label')}
              >
                <Icon name="X" size={20} />
              </Button>
            )}
          </header>

          <main className={styles.modalBody}>
            {children}
          </main>
        </div>
      </dialog>
    </div>
  )
})