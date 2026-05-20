import { AlertCircle, AlertTriangle, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '../../atoms/index.js'
import { Alert, Loading } from '../../molecules/index.js'

import styles from './EditorValidation.module.scss'

export default function EditorValidation({
  diagnostics,
  isValidating,
  hasValidated,
  onValidate,
  onClear,
  onNavigate,
}) {
  const { t } = useTranslation('editor')

  const errorCount = diagnostics.filter((d) => d.severity === 'error').length
  const warningCount = diagnostics.filter(
    (d) => d.severity === 'warning'
  ).length

  return (
    <div className={styles.container}>
      <header>
        <h2 className={styles.title}>{t('validation.title')}</h2>
      </header>

      <div className={styles.actions}>
        <Button primary onClick={onValidate} disabled={isValidating}>
          {t('validation.run')}
        </Button>
        {hasValidated && (
          <Button onClick={onClear} disabled={isValidating}>
            {t('validation.clear')}
          </Button>
        )}
      </div>

      {isValidating && <Loading label="validation.running" />}

      {!isValidating && !hasValidated && (
        <Alert type="info" message={t('validation.empty')} />
      )}

      {!isValidating && hasValidated && diagnostics.length === 0 && (
        <Alert type="success" message={t('validation.success')} />
      )}

      {!isValidating && diagnostics.length > 0 && (
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

          <ul className={styles.diagnosticList}>
            {diagnostics.map((d, i) => (
              <li
                key={i}
                className={styles[d.severity]}
                onClick={() => onNavigate?.(d.line, d.column)}
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
                <span className={styles.location}>:{d.line}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
