import { useCallback, useRef, useState } from 'react'
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

  const [validationState, setValidationState] = useState({
    diagnostics: [],
    isValidating: false,
    hasValidated: false,
  })
  const validatorApiRef = useRef(null)

  const handleValidatorReady = useCallback(
    ({
      validate,
      diagnostics,
      isValidating,
      hasValidated,
      clearDiagnostics,
      navigateTo,
    }) => {
      validatorApiRef.current = { validate, clearDiagnostics, navigateTo }
      setValidationState({ diagnostics, isValidating, hasValidated })
    },
    []
  )

  const handleValidate = useCallback(() => {
    validatorApiRef.current?.validate()
  }, [])

  const handleClearDiagnostics = useCallback(() => {
    validatorApiRef.current?.clearDiagnostics()
  }, [])

  const handleNavigateTo = useCallback((line, column) => {
    validatorApiRef.current?.navigateTo(line, column)
  }, [])

  const handleActiveMenuChange = useCallback(
    (value) => {
      setActiveMenu(value)
    },
    [setActiveMenu]
  )

  return (
    <section className={styles.container}>
      <div className={styles.content}>
        <div className={styles.editor}>
          <CollaborativeTextEditor
            mode={mode}
            articleId={articleId}
            versionId={versionId}
            onValidatorReady={handleValidatorReady}
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
          onValidate={handleValidate}
          onClearDiagnostics={handleClearDiagnostics}
          onNavigateToDiagnostic={handleNavigateTo}
        />
      </div>

      <div>
        <EditorMenu articleId={articleId} onChange={handleActiveMenuChange} />
      </div>
    </section>
  )
}
