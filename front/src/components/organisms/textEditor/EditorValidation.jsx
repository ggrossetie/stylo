import clsx from 'clsx'
import { AlertCircle, AlertTriangle } from 'lucide-react'
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'

import { VALIDATOR_PROFILE_DEFS } from '../../../helpers/validator/index.js'
import { Alert, Loading } from '../../molecules/index.js'

import styles from './EditorValidation.module.scss'

const EditorValidation = forwardRef(function EditorValidation(
  {
    diagnostics,
    isValidating,
    hasValidated,
    enabledProfiles = [],
    onProfileToggle,
    onNavigate,
  },
  ref
) {
  const { t } = useTranslation('editor')
  const containerRef = useRef(null)
  const listRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const errorCount = diagnostics.filter((d) => d.severity === 'error').length
  const warningCount = diagnostics.filter(
    (d) => d.severity === 'warning'
  ).length
  const isRefreshing = isValidating && hasValidated

  useImperativeHandle(ref, () => ({
    focus: () => (listRef.current ?? containerRef.current)?.focus(),
  }))

  // Keep the active item within bounds when results change (live re-validation)
  useEffect(() => {
    setActiveIndex((index) =>
      Math.max(0, Math.min(index, diagnostics.length - 1))
    )
  }, [diagnostics.length])

  const moveTo = useCallback((index) => {
    setActiveIndex(index)
    listRef.current?.children[index]?.scrollIntoView({ block: 'nearest' })
  }, [])

  const handleKeyDown = useCallback(
    (event) => {
      // Let the profile checkboxes handle their own keys
      if (event.target instanceof HTMLInputElement) return

      if (diagnostics.length === 0) return

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          moveTo(Math.min(activeIndex + 1, diagnostics.length - 1))
          break
        case 'ArrowUp':
          event.preventDefault()
          moveTo(Math.max(activeIndex - 1, 0))
          break
        case 'Home':
          event.preventDefault()
          moveTo(0)
          break
        case 'End':
          event.preventDefault()
          moveTo(diagnostics.length - 1)
          break
        case 'Enter':
        case ' ': {
          event.preventDefault()
          const diagnostic = diagnostics[activeIndex]
          if (diagnostic) {
            onNavigate?.(diagnostic.line, diagnostic.column)
          }
          break
        }
        default:
      }
    },
    [activeIndex, diagnostics, moveTo, onNavigate]
  )

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={t('validation.title')}
      tabIndex={-1}
      className={styles.container}
      onKeyDown={handleKeyDown}
    >
      <header>
        <h2 className={styles.title}>{t('validation.title')}</h2>
      </header>

      <section className={styles.profilesSection}>
        <div className={styles.profiles}>
          {VALIDATOR_PROFILE_DEFS.map(({ id, labelKey }) => (
            <label key={id} className={styles.profileLabel}>
              <input
                type="checkbox"
                checked={enabledProfiles.includes(id)}
                onChange={() => onProfileToggle?.(id)}
              />
              {t(labelKey)}
            </label>
          ))}
        </div>
      </section>

      {enabledProfiles.length === 0 && (
        <Alert type="info" message={t('validation.noProfile')} />
      )}

      {isValidating && !hasValidated && <Loading label="validation.running" />}

      {isRefreshing && <Loading size="0.85rem" label="validation.refreshing" />}

      {!isRefreshing &&
        !isValidating &&
        hasValidated &&
        diagnostics.length === 0 && (
          <Alert type="success" message={t('validation.success')} />
        )}

      {!isRefreshing && hasValidated && diagnostics.length > 0 && (
        <>
          {errorCount > 0 && (
            <Alert
              type="error"
              message={t('validation.errorSummary', { count: errorCount })}
            />
          )}
          {warningCount > 0 && (
            <Alert
              type="warning"
              message={t('validation.warningSummary', { count: warningCount })}
            />
          )}

          <div
            ref={listRef}
            role="listbox"
            tabIndex={0}
            aria-label={t('validation.listLabel')}
            aria-activedescendant={`validation-diagnostic-${activeIndex}`}
            className={styles.diagnosticList}
          >
            {diagnostics.map((d, i) => (
              <div
                key={i}
                id={`validation-diagnostic-${i}`}
                role="option"
                tabIndex={-1}
                aria-selected={i === activeIndex}
                className={clsx(
                  styles[d.severity],
                  i === activeIndex && styles.selected
                )}
                onClick={() => {
                  setActiveIndex(i)
                  onNavigate?.(d.line, d.column)
                }}
                onKeyDown={() => {}}
                title={t('validation.navigateTo', { line: d.line })}
              >
                <span className={styles.icon}>
                  {d.severity === 'error' ? (
                    <AlertCircle size={14} />
                  ) : (
                    <AlertTriangle size={14} />
                  )}
                </span>
                <span className={styles.message}>{d.message}</span>
                <span className={styles.location}>
                  {t('validation.line')} {d.line}
                </span>
              </div>
            ))}
          </div>

          <p className={styles.keyboardHint}>{t('validation.keyboardHint')}</p>
        </>
      )}
    </div>
  )
})

export default EditorValidation
