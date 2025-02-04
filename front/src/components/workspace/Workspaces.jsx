import { Button, useModal } from '@geist-ui/core'
import React, { useEffect, useState } from 'react'
import { Search } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { shallowEqual, useSelector } from 'react-redux'
import Field from '../../components/Field.jsx'

import WorkspaceItem from '../../components/workspace/WorkspaceItem.jsx'

import { CurrentUserContext } from '../../contexts/CurrentUser'
import { useGraphQL } from '../../helpers/graphQL.js'
import { useWorkspaces } from '../../hooks/workspace.js'
import Loading from '../Loading.jsx'
import CreateWorkspaceModal from './CreateWorkspaceModal.jsx'
import { getUserStats } from './Workspaces.graphql'

import styles from './workspaces.module.scss'

export default function Workspaces() {
  const { t } = useTranslation()
  const activeUser = useSelector((state) => state.activeUser, shallowEqual)
  const [filter, setFilter] = useState('')
  const { workspaces, error, isLoading } = useWorkspaces()
  const workspaceCreateModal = useModal()

  const [personalWorkspace, setPersonalWorkspace] = useState({
    _id: activeUser._id,
    personal: true,
    members: [],
  })
  const runQuery = useGraphQL()

  useEffect(() => {
    ;(async () => {
      try {
        const getUserStatsResponse = await runQuery({ query: getUserStats })
        const userStats = getUserStatsResponse.user.stats
        setPersonalWorkspace({
          _id: activeUser._id,
          personal: true,
          name: t('workspace.myspace'),
          description: '',
          color: '#D9D9D9',
          createdAt: activeUser.createdAt,
          updatedAt: activeUser.updatedAt,
          members: [],
          articlesCount:
            userStats.myArticlesCount + userStats.contributedArticlesCount,
        })
      } catch (err) {
        alert(err)
      }
    })()
  }, [activeUser._id, t])

  if (error) {
    return <div>Unable to load the workspaces</div>
  }
  if (isLoading) {
    return <Loading />
  }

  return (
    <CurrentUserContext.Provider value={activeUser}>
      <section className={styles.section}>
        <h1>{t('workspace.title')}</h1>
        <div>
          <Field
            className={styles.searchField}
            type="text"
            icon={Search}
            value={filter}
            placeholder={t('search.placeholder')}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <Button
          type="secondary"
          className={styles.button}
          onClick={() => workspaceCreateModal.setVisible(true)}
        >
          {t('workspace.createNew.button')}
        </Button>

        <CreateWorkspaceModal {...workspaceCreateModal} />

        <ul className={styles.workspacesList}>
          {[personalWorkspace, ...workspaces].map((workspace) => (
            <li key={`workspace-${workspace._id}`}>
              <WorkspaceItem workspace={workspace} />
            </li>
          ))}
        </ul>
      </section>
    </CurrentUserContext.Provider>
  )
}
