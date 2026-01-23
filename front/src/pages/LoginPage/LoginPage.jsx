import React from 'react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import AuthLayout from '../../components/templates/AuthLayout/AuthLayout.jsx'
import LoginForm from '../../components/organisms/Forms/LoginForm/LoginForm.jsx'

export default function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleLoginSuccess = () => {
    navigate('/', { replace: true })
  }

  return (
    <>
      <Helmet>
        <title>{t('login.pageTitle')} - Stylo</title>
        <meta name="description" content={t('login.pageDescription')} />
      </Helmet>
      
      <AuthLayout 
        title={t('login.title')}
        subtitle={t('login.subtitle')}
      >
        <LoginForm onSuccess={handleLoginSuccess} />
      </AuthLayout>
    </>
  )
}