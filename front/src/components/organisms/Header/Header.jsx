import clsx from 'clsx'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { Link, NavLink, useLocation, useRouteLoaderData } from 'react-router'

import logoContent from '/images/logo.svg?inline'

import useComponentVisible from '../../../hooks/componentVisible.js'
import { useActiveWorkspaceId } from '../../../hooks/workspace.js'
import { Button, Icon } from '../../atoms/index.js'
import WorkspacesMenu from '../../workspace/WorkspacesMenu.jsx'

import HelpMenu from './HelpMenu.jsx'
import LanguagesMenu from './LanguagesMenu.jsx'
import UserMenu from './UserMenu.jsx'

import styles from './Header.module.scss'

export default function Header() {
  const { t } = useTranslation()
  const activeWorkspaceId = useActiveWorkspaceId()
  const dispatch = useDispatch()
  const { user } = useRouteLoaderData('app')
  const location = useLocation()
  const activeTool = location.pathname.includes('/corpus')
    ? 'corpus'
    : 'articles'
  const userId = user?._id
  const baseUrl = useMemo(
    () => (activeWorkspaceId ? `/workspaces/${activeWorkspaceId}` : ''),
    [activeWorkspaceId]
  )
  const {
    ref: workspacesRef,
    isComponentVisible: areWorkspacesVisible,
    toggleComponentIsVisible: toggleWorkspaces,
  } = useComponentVisible(false, 'workspaces')
  const {
    ref: toolsRef,
    isComponentVisible: areToolsVisible,
    toggleComponentIsVisible: toggleTools,
  } = useComponentVisible(false, 'tools')

  const resetWorkspaceId = useCallback(() => {
    dispatch({ type: 'SET_USER_PREFERENCES', key: 'workspaceId', value: null })
  }, [])

  return (
    <header className={styles.header} role="banner">
      <nav className={styles.navbar}>
        <div className={styles.brand}>
          <Link to={baseUrl || '/'} className={styles.logo}>
            <div
              className={styles.logoSvg}
              dangerouslySetInnerHTML={{ __html: logoContent }}
            />
            <span className={styles.title}>Stylo</span>
          </Link>
        </div>

        {userId && (
          <div className={styles.navigation}>
            <div className={styles.workspaces} ref={workspacesRef}>
              <Button
                tertiary
                onClick={toggleWorkspaces}
                className={clsx(styles.navButton, {
                  [styles.active]: areWorkspacesVisible,
                })}
                aria-expanded={areWorkspacesVisible}
                aria-haspopup="true"
              >
                <Icon name="Users" size={16} />
                {t('header.workspaces')}
                <Icon name="ChevronDown" size={14} />
              </Button>
              {areWorkspacesVisible && (
                <WorkspacesMenu onWorkspaceChange={resetWorkspaceId} />
              )}
            </div>

            <div className={styles.tools} ref={toolsRef}>
              <Button
                tertiary
                onClick={toggleTools}
                className={clsx(styles.navButton, {
                  [styles.active]: areToolsVisible,
                })}
                aria-expanded={areToolsVisible}
                aria-haspopup="true"
              >
                <Icon name="Briefcase" size={16} />
                {t('header.tools')}
                <Icon name="ChevronDown" size={14} />
              </Button>
              {areToolsVisible && (
                <div className={styles.toolsMenu}>
                  <NavLink
                    to={`${baseUrl}/articles`}
                    className={({ isActive }) =>
                      clsx(styles.toolLink, { [styles.active]: isActive })
                    }
                  >
                    <Icon name="FileText" size={16} />
                    {t('header.articles')}
                  </NavLink>
                  <NavLink
                    to={`${baseUrl}/corpus`}
                    className={({ isActive }) =>
                      clsx(styles.toolLink, { [styles.active]: isActive })
                    }
                  >
                    <Icon name="Library" size={16} />
                    {t('header.corpus')}
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        )}

        <div className={styles.actions}>
          <LanguagesMenu />
          <HelpMenu />
          {userId && <UserMenu user={user} />}
        </div>
      </nav>
    </header>
  )
}