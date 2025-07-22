import { useMemo } from 'react'

import useHypothesisSearch from '../../hooks/hypothesis.js'

import TimeAgo from '../TimeAgo.jsx'
import Alert from '../molecules/Alert.jsx'
import Loading from '../molecules/Loading.jsx'

import styles from './AnnotationsSummary.module.scss'

export default function AnnotationsSummary() {
  const { annotations, error, isLoading } = useHypothesisSearch({
    uri: 'https://stylo-dev.huma-num.fr/api/v1/htmlArticle/621e4ceb5aeb010013e41fb5?preview=true',
  })
  if (isLoading) {
    return <Loading />
  }
  if (error) {
    return <Alert message={error.message} />
  }
  if (annotations.length === 0) {
    return <Alert type="info" message="No annotations found" />
  }

  return (
    <div className={styles.container}>
      {annotations.map((annotation) => {
        return (
          <article className={styles.thread}>
            <header className={styles.header}>
              <div>
                <AnnotationUser user={annotation.user} />
              </div>
              <div>
                <TimeAgo date={annotation.updated} />
              </div>
            </header>
            <main className={styles.main}>
              <span>{annotation.text}</span>

              {annotation.replies?.length > 0 && (
                <div className={styles.repliesContainer}>
                  <h5>Replies</h5>
                  <div className={styles.repliesThread}>
                    {annotation.replies?.map((reply) => (
                      <div className={styles.replyThread}>
                        <header className={styles.header}>
                          <AnnotationUser user={reply.user} />
                          <TimeAgo date={annotation.updated} />
                        </header>
                        <div>{reply.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </main>
            <footer>
              <div className={styles.tags}>
                {annotation.tags.map((tag) => (
                  <div className={styles.tag}>{tag}</div>
                ))}
              </div>
            </footer>

            <span>{annotation.references}</span>
          </article>
        )
      })}
    </div>
  )
}

function AnnotationUser({ user }) {
  const rx = /^acct:(.*)@hypothes\.is$/
  const name = useMemo(() => {
    const result = rx.exec(user)
    return result[1]
  }, [user])

  return <div className={styles.name}>{name}</div>
}
