import React, { useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import YAML from 'js-yaml'
import { merge } from 'allof-merge'
import Form from '../../Form'
import { toYaml } from "../metadata/yaml.js"
import { convertLegacyValues } from "../../metadata/MetadataValues.js"
import defaultUiSchema from "../../../schemas/article-ui-schema.json"
import defaultSchema from '../../../schemas/article-metadata.schema.json'

export default function YamlEditor({ yaml = '', onChange = () => {} }) {
  const effectiveSchema = useMemo(
    () => merge(defaultSchema),
    [defaultSchema]
  )
  const [parsed = {}] = YAML.loadAll(yaml)
  const formData = convertLegacyValues(parsed)
  const handleChange = useCallback((newFormData) => onChange(toYaml(newFormData)), [onChange])
  return <Form formData={formData} schema={effectiveSchema} uiSchema={defaultUiSchema} onChange={handleChange}/>
}

YamlEditor.propTypes = {
  yaml: PropTypes.string,
  basicMode: PropTypes.bool,
  onChange: PropTypes.func
}
