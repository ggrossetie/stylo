import React from 'react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { useRouteLoaderData } from 'react-router'

import AppLayout from '../../components/templates/AppLayout/AppLayout.jsx'
import { PageTitle } from '../../components/atoms/index.js'

export default function HomePage() {
  const { t } = useTranslation()
  const { user } = useRouteLoaderData('app') || {}

  return (
    <>
      <Helmet>
        <title>{t('home.pageTitle')} - Stylo</title>
        <meta name="description" content={t('home.pageDescription')} />
      </Helmet>
      
      <AppLayout>
        <div className="container">
          <PageTitle>{t('home.welcome', { name: user?.displayName || user?.username })}</PageTitle>
          
          <div className="row">
            <div className="col-md-8">
              <h2>{t('home.recentArticles')}</h2>
              {/* Contenu des articles récents */}
            </div>
            
            <div className="col-md-4">
              <h2>{t('home.quickActions')}</h2>
              {/* Actions rapides */}
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  )
}