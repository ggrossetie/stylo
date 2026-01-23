import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { Link, useRevalidator } from 'react-router'
import { toast } from 'react-toastify'

import { applicationConfig } from '../../../../config.js'
import { fromFormData } from '../../../../helpers/forms.js'
import { Alert, FormActions } from '../../../molecules/index.js'
import { Button, Field, Input, Link as StyledLink } from '../../../atoms/index.js'

import styles from './LoginForm.module.scss'

export default function LoginForm({ 
  onSuccess,
  showRegisterLink = true,
  showForgotPassword = true 
}) {
  const { t } = useTranslation()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const dispatch = useDispatch()
  const revalidator = useRevalidator()

  const { backendEndpoint } = applicationConfig

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const data = fromFormData(event.target)

      const response = await fetch(backendEndpoint + '/login/local', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Login failed')
      }

      dispatch({ type: 'UPDATE_SESSION_TOKEN', token: result.token })
      revalidator.revalidate()
      toast.success(t('login.success'))
      onSuccess?.()
    } catch (err) {
      setError(err.message || t('login.error'))
    } finally {
      setIsLoading(false)
    }
  }, [backendEndpoint, dispatch, revalidator, t, onSuccess])

  return (
    <form onSubmit={handleSubmit} className={styles.loginForm}>
      {error && (
        <Alert variant="danger" className={styles.errorAlert}>
          {error}
        </Alert>
      )}

      <Field label={t('login.username')} required>
        <Input
          type="text"
          name="username"
          required
          autoFocus
          disabled={isLoading}
          placeholder={t('login.usernamePlaceholder')}
        />
      </Field>

      <Field label={t('login.password')} required>
        <Input
          type="password"
          name="password"
          required
          disabled={isLoading}
          placeholder={t('login.passwordPlaceholder')}
        />
      </Field>

      <FormActions>
        <Button 
          type="submit" 
          primary 
          disabled={isLoading}
          className={styles.submitButton}
        >
          {isLoading ? t('login.loading') : t('login.submit')}
        </Button>
      </FormActions>

      {(showRegisterLink || showForgotPassword) && (
        <div className={styles.links}>
          {showRegisterLink && (
            <StyledLink to="/register">
              {t('login.noAccount')}
            </StyledLink>
          )}
          {showForgotPassword && (
            <StyledLink to="/forgot-password">
              {t('login.forgotPassword')}
            </StyledLink>
          )}
        </div>
      )}
    </form>
  )
}