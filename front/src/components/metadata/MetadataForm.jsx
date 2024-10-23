import React from 'react'
import PropTypes from 'prop-types'

import Form from '../Form.jsx'
import { convertLegacyValues } from './MetadataValues.js'

/**
 * @param data Values in JSON format
 * @param templates List of template names
 * @param schema Data schema
 * @param uiSchema UI schema
 * @param onChange Function that return the values in YAML format
 * @returns {Element}
 * @constructor
 */
export default function MetadataForm ({
  data,
  templates,
  uiSchema,
  schema,
  onChange
}) {
  const formData = convertLegacyValues(data)
  const basicMode = templates.includes('basic')
  return <Form schema={schema} uiSchema={uiSchema} formData={formData} basicMode={basicMode} onChange={onChange}/>
}

MetadataForm.propTypes = {
  data: PropTypes.object,
  uiSchema: PropTypes.object,
  schema: PropTypes.object,
  templates: PropTypes.array,
  onChange: PropTypes.func,
}

