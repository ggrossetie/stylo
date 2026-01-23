import React from 'react'
import { Outlet } from 'react-router'

import Header from '../../organisms/Header/Header.jsx'
import Footer from '../../Footer.jsx'
import SkipLinks from '../../SkipLinks.jsx'

import styles from './AppLayout.module.scss'

export default function AppLayout({ children }) {
  return (
    <div className={styles.appLayout}>
      <SkipLinks />
      <Header />
      <main id="main-content" className={styles.mainContent}>
        {children || <Outlet />}
      </main>
      <Footer />
    </div>
  )
}