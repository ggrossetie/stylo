import React from 'react'
import SchemaForm from '../components/Form.jsx'
import uiSchema from './form-story-ui-schema.json'
import schema from './form-story.schema.json'

export default {
  title: 'Stylo/SchemaForm',
  component: SchemaForm,
  parameters: {
    layout: 'centered',
  },
}

export const Article = {
  render: () => {
    return <SchemaForm formData={{}} uiSchema={uiSchema} schema={schema}/>
  },
}

export const Basic = {
  args: {
    formData: {},
    uiSchema: {},
    schema: {
      "type": "object",
      "properties": {
        "id": {
          "type": "string"
        },
        "date": {
          "type": "string",
          "format": "date"
        },
        "url": {
          "type": "string"
        }
      }
    }
  }
}
