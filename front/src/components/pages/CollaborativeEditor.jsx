import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router'

import { executeQuery } from '../../helpers/graphQL.js'
import { getArticleInfo } from '../../hooks/Article.graphql'
import { usePreferenceItem } from '../../hooks/user.js'
import {
  ArticleStats,
  CollaborativeTextEditor,
  EditorMenu,
} from '../organisms/index.js'
import EditorMenuContent from '../organisms/textEditor/EditorMenuContent.jsx'

import styles from './CollaborativeEditor.module.scss'

const articleIdRx = /^[a-f\d]{24}$/i

export async function loader({ params }) {
  const { id: articleId } = params

  if (articleId && articleIdRx.test(articleId) === false) {
    throw new Response(`Invalid article id ${articleId}`, { status: 400 })
  }

  const sessionToken = localStorage.getItem('sessionToken')
  try {
    const { article } = await executeQuery({
      query: getArticleInfo,
      variables: { articleId },
      sessionToken,
    })
    return { article }
  } catch (err) {
    const errorMessage = err.messages?.[0]?.message ?? err.message
    const errorType = err.messages?.[0]?.extensions?.type

    if (errorType === 'NOT_FOUND') {
      throw new Response(errorMessage, { status: 404 })
    }

    throw err
  }
}

export default function CollaborativeEditor(props) {
  const { id: articleId, version: versionId } = useParams()
  const [searchParams] = useSearchParams({ mode: props.mode ?? 'write' })
  const mode = searchParams.get('mode')
  const { value: activeMenu, setValue: setActiveMenu } = usePreferenceItem(
    `${articleId}.activeMenu`,
    'article'
  )

  // One preference per profile — default false (opt-in)
  const { value: metopesEnabled, setValue: setMetopesEnabled } =
    usePreferenceItem(`${articleId}.validation.profile.metopes`, 'article')

  const enabledProfiles = useMemo(
    () => (metopesEnabled === true ? ['metopes'] : []),
    [metopesEnabled]
  )

  const handleProfileToggle = useCallback(
    (profileId) => {
      if (profileId === 'metopes') {
        setMetopesEnabled(!(metopesEnabled === true))
      }
    },
    [metopesEnabled, setMetopesEnabled]
  )

  const [validationState, setValidationState] = useState({
    diagnostics: [],
    isValidating: false,
    hasValidated: false,
  })
  const validatorApiRef = useRef(null)
  const validationPanelRef = useRef(null)
  const menuContentRef = useRef(null)
  const menuRef = useRef(null)
  const lastPanelFocusRef = useRef(null)
  const activeMenuRef = useRef(activeMenu)
  activeMenuRef.current = activeMenu
  const enabledProfilesRef = useRef(enabledProfiles)
  enabledProfilesRef.current = enabledProfiles

  const handleValidatorReady = useCallback(
    ({
      validate,
      diagnostics,
      isValidating,
      hasValidated,
      clearDiagnostics,
      navigateTo,
      focusEditor,
    }) => {
      validatorApiRef.current = {
        validate,
        clearDiagnostics,
        navigateTo,
        focusEditor,
      }
      setValidationState({ diagnostics, isValidating, hasValidated })
    },
    []
  )

  const handleValidate = useCallback(() => {
    if (enabledProfilesRef.current.length > 0) {
      validatorApiRef.current?.validate()
    }
  }, [])

  const handleEditorReady = useCallback(() => {
    if (
      activeMenuRef.current === 'validation' &&
      enabledProfilesRef.current.length > 0
    ) {
      handleValidate()
    }
  }, [handleValidate])

  const handleClearDiagnostics = useCallback(() => {
    validatorApiRef.current?.clearDiagnostics()
  }, [])

  const handleNavigateTo = useCallback((line, column) => {
    validatorApiRef.current?.navigateTo(line, column)
  }, [])

  // Escape inside a panel: close it and hand focus back to its menu item
  const handleClosePanel = useCallback(() => {
    const name = activeMenuRef.current
    setActiveMenu('')
    menuRef.current?.focusItem(name)
  }, [setActiveMenu])

  const handleFocusEditor = useCallback(() => {
    validatorApiRef.current?.focusEditor()
  }, [])

  // ArrowRight inside a panel: move focus back to its menu item
  const handleFocusMenu = useCallback(() => {
    menuRef.current?.focusItem(activeMenuRef.current)
  }, [])

  // ArrowLeft on a menu item: move focus into the open panel, or to the editor
  const handleMenuNavigateLeft = useCallback(() => {
    const name = activeMenuRef.current
    if (!name) {
      handleFocusEditor()
    } else if (name === 'validation') {
      validationPanelRef.current?.focus()
    } else {
      menuContentRef.current?.focus()
    }
  }, [handleFocusEditor])

  // Remember the last focused element inside the open panel (restored by Alt+M)
  useEffect(() => {
    const node = menuContentRef.current
    if (!node) return
    const handleFocusIn = (event) => {
      lastPanelFocusRef.current = event.target
    }
    node.addEventListener('focusin', handleFocusIn)
    return () => {
      node.removeEventListener('focusin', handleFocusIn)
      lastPanelFocusRef.current = null
    }
  }, [activeMenu])

  // Alt+M from the editor: focus the open panel (last focused element) or the menu
  const handleFocusSideMenu = useCallback(() => {
    const name = activeMenuRef.current
    if (!name) {
      menuRef.current?.focus()
    } else if (lastPanelFocusRef.current?.isConnected) {
      lastPanelFocusRef.current.focus()
    } else if (name === 'validation') {
      validationPanelRef.current?.focus()
    } else {
      menuContentRef.current?.focus()
    }
  }, [])

  const handleActiveMenuChange = useCallback(
    (value) => {
      setActiveMenu(value)
    },
    [setActiveMenu]
  )

  // Auto-validate when opening the panel, clear when closing
  const prevActiveMenuRef = useRef(activeMenu)
  useEffect(() => {
    if (activeMenu === 'validation') {
      handleValidate()
    } else if (prevActiveMenuRef.current === 'validation') {
      handleClearDiagnostics()
    }
    prevActiveMenuRef.current = activeMenu
  }, [activeMenu, handleValidate, handleClearDiagnostics])

  // Re-validate (or clear) when the profile selection changes while panel is open.
  // activeMenu is intentionally read via ref to avoid firing on panel open/close
  // (that case is already handled by the effect above).
  useEffect(() => {
    if (activeMenuRef.current !== 'validation') return
    if (enabledProfiles.length > 0) {
      handleValidate()
    } else {
      handleClearDiagnostics()
    }
  }, [enabledProfiles, handleValidate, handleClearDiagnostics])

  return (
    <section className={styles.container}>
      <div className={styles.content}>
        <div className={styles.editor}>
          <CollaborativeTextEditor
            mode={mode}
            articleId={articleId}
            versionId={versionId}
            profiles={enabledProfiles}
            onValidatorReady={handleValidatorReady}
            onEditorReady={handleEditorReady}
            onFocusSideMenu={handleFocusSideMenu}
          />
          <ArticleStats />
        </div>
        <EditorMenuContent
          articleId={articleId}
          versionId={versionId}
          activeMenu={activeMenu}
          validationDiagnostics={validationState.diagnostics}
          isValidating={validationState.isValidating}
          hasValidated={validationState.hasValidated}
          enabledProfiles={enabledProfiles}
          onProfileToggle={handleProfileToggle}
          onNavigateToDiagnostic={handleNavigateTo}
          onClose={handleClosePanel}
          onFocusMenu={handleFocusMenu}
          onFocusEditor={handleFocusEditor}
          panelRef={menuContentRef}
          validationPanelRef={validationPanelRef}
        />
      </div>

      <div>
        <EditorMenu
          articleId={articleId}
          onChange={handleActiveMenuChange}
          onNavigateLeft={handleMenuNavigateLeft}
          menuRef={menuRef}
        />
      </div>
    </section>
  )
}
