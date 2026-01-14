import React from 'react'

import Loading from '../molecules/Loading.jsx'

import styles from '../organisms/Page.module.scss'

export default function LoadingPage() {
  return (
    <section className={styles.container}>
      <article className={styles.simplePage}>
        <Loading />
      </article>
    </section>
  )
}
