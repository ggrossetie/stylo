import { Toggle } from '@geist-ui/core'
import YAML from 'js-yaml'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'

import { useArticleWorkingCopyActions } from '../../hooks/article.js'
import { toYaml } from './metadata/yaml.js'

import MonacoYamlEditor from './providers/monaco/YamlEditor'
import ArticleEditorMetadataForm from './yamleditor/ArticleEditorMetadataForm.jsx'

import styles from './articleEditorMetadata.module.scss'

/**
 * @param {object} props properties
 * @param {any} props.metadata
 * @param {boolean} props.readOnly
 * @returns {Element}
 */
export default function ArticleMetadata({ readOnly, metadata, articleId }) {
  const { updateMetadata } = useArticleWorkingCopyActions({ articleId })
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const selector = useSelector(
    (state) => state.articlePreferences.metadataFormMode
  )
  const yaml = useMemo(() => toYaml(metadata), [metadata])
  const [rawYaml, setRawYaml] = useState(yaml)
  const [error, setError] = useState('')

  const setSelector = useCallback(
    (value) =>
      dispatch({
        type: 'ARTICLE_PREFERENCES_TOGGLE',
        key: 'metadataFormMode',
        value,
      }),
    []
  )

  const handleFormUpdate = useCallback(
    async (metadata) => {
      if (readOnly) {
        return
      }
      setRawYaml(toYaml(metadata))
      await updateMetadata(metadata)
    },
    [readOnly, setRawYaml]
  )

  const handleRawYamlChange = useCallback(
    async (yaml) => {
      try {
        const [metadata = {}] = YAML.loadAll(yaml)
        setError('')
        await updateMetadata(metadata)
      } catch (err) {
        setError(err.message)
      } finally {
        setRawYaml(yaml)
      }
    },
    [setRawYaml]
  )

  return (
    <div className={styles.yamlEditor}>
      <header className={styles.header}>
        <h2>{t('metadata.title')}</h2>
        <div
          className={styles.toggle}
          onClick={() => setSelector(selector === 'raw' ? 'basic' : 'raw')}
        >
          <Toggle
            id="raw-mode"
            checked={selector === 'raw'}
            title={'Activer le mode YAML'}
            onChange={(e) => {
              setSelector(e.target.checked ? 'raw' : 'basic')
            }}
          />
          <label htmlFor="raw-mode">YAML</label>
        </div>
      </header>
      {selector === 'raw' && (
        <>
          {error !== '' && <p className={styles.error}>{error}</p>}
          <MonacoYamlEditor
            readOnly={readOnly}
            height="calc(100vh - 280px)"
            fontSize="14"
            text={rawYaml}
            onTextUpdate={handleRawYamlChange}
          />
        </>
      )}
      {selector !== 'raw' && (
        <ArticleEditorMetadataForm
          readOnly={readOnly}
          metadata={metadata}
          error={(reason) => {
            setError(reason)
            if (reason !== '') {
              setSelector('raw')
            }
          }}
          onChange={handleFormUpdate}
        />
      )}
    </div>
  )
}
