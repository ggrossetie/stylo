import * as monaco from 'monaco-editor'
import { useCallback, useRef, useState } from 'react'

import { VALIDATORS } from '../helpers/validator/index.js'

const MARKER_OWNER = 'stylo-validator'

/**
 * @param {'error'|'warning'} severity
 * @returns {number}
 */
function toMonacoSeverity(severity) {
  return severity === 'error'
    ? monaco.MarkerSeverity.Error
    : monaco.MarkerSeverity.Warning
}

/**
 * @param {import('react').RefObject} editorRef
 * @param {string} profile - validator profile name (e.g. 'metopes')
 * @returns {{ validate: () => Promise<void>, diagnostics: Array, isValidating: boolean, clearDiagnostics: () => void }}
 */
export function useMarkdownValidator(editorRef, profile = 'metopes') {
  const [diagnostics, setDiagnostics] = useState([])
  const [isValidating, setIsValidating] = useState(false)
  const [hasValidated, setHasValidated] = useState(false)
  const profileRef = useRef(profile)
  profileRef.current = profile

  const validate = useCallback(async () => {
    const editor = editorRef.current
    if (!editor) return

    const validator = VALIDATORS[profileRef.current]
    if (!validator) return

    const markdown = editor.getModel()?.getValue() ?? ''
    setIsValidating(true)

    try {
      const results = await validator(markdown)
      setDiagnostics(results)
      setHasValidated(true)

      const model = editor.getModel()
      if (model) {
        monaco.editor.setModelMarkers(
          model,
          MARKER_OWNER,
          results.map((d) => ({
            startLineNumber: d.line,
            startColumn: d.column,
            endLineNumber: d.endLine,
            endColumn: d.endColumn,
            message: d.message,
            severity: toMonacoSeverity(d.severity),
            code: d.code,
          }))
        )
      }
    } finally {
      setIsValidating(false)
    }
  }, [editorRef])

  const clearDiagnostics = useCallback(() => {
    const editor = editorRef.current
    const model = editor?.getModel()
    if (model) {
      monaco.editor.setModelMarkers(model, MARKER_OWNER, [])
    }
    setDiagnostics([])
    setHasValidated(false)
  }, [editorRef])

  const navigateTo = useCallback((line, column = 1) => {
    const editor = editorRef.current
    if (!editor) return
    const endColumn = editor.getModel()?.getLineMaxColumn(line) ?? column
    editor.focus()
    editor.setPosition({ lineNumber: line, column: endColumn })
    editor.revealLineNearTop(line, 1)
  }, [editorRef])

  return { validate, diagnostics, isValidating, hasValidated, clearDiagnostics, navigateTo }
}