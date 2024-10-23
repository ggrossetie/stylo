import React, { Fragment, useCallback, useMemo, useState } from 'react'
import Form from '@rjsf/core'
import { set } from 'object-path-immutable'
import { useTranslation } from 'react-i18next'
import basicUiSchema from '../schemas/ui-schema-basic-override.json'
import defaultUiSchema from '../schemas/ui-schema-editor.json'
import defaultSchema from '../schemas/data-schema.json'
import { toYaml } from './Write/metadata/yaml'

// REMIND: use a custom SelectWidget to support "ui:emptyValue"
// remove once fixed in https://github.com/rjsf-team/react-jsonschema-form/issues/1041
import SelectWidget from './SelectWidget'
import isidoreKeywordSearch from './Write/metadata/isidoreKeyword'
import isidoreAuthorSearch from './Write/metadata/isidoreAuthor'

import styles from './form.module.scss'
import Button from './Button'
import { Plus, Trash } from 'react-feather'
import IsidoreAuthorAPIAutocompleteField from './Write/metadata/isidoreAuthor'


const CustomSelectBuilder = function ({ translationHook }) {
  return function CustomSelect (props) {
    const { options, title } = props
    const enumOptions = options?.enumOptions?.map((opt) => {
      if (title && opt.label in title) {
        return {
          label: translationHook(title[opt.label]),
          value: opt.value
        }
      }
      return {
        label: translationHook(opt.label),
        value: opt.value
      }
    })
    return (<div className={styles.selectContainer}>
      <SelectWidget {...{ ...props, options: { enumOptions: enumOptions } }}/>
    </div>)
  }
}

function ArrayFieldTemplate (props) {
  const addItemTitle = props.uiSchema['ui:add-item-title'] || 'Ajouter'
  const removeItemTitle = props.uiSchema['ui:remove-item-title'] || 'Supprimer'
  const title = props.uiSchema['ui:title']

  const inlineRemoveButton = props.schema?.items?.type === 'string'
  return (
    <fieldset className={styles.fieldset} key={props.key}>
      {title && <legend id={props.id}>{title}</legend>}
      {props.items &&
        props.items.map((element) => (
          <div
            id={element.key}
            key={element.key}
            className={`${element.className} can-add-remove`}
          >
            {element.children}
            {element.hasRemove && (
              <Button
                icon={inlineRemoveButton}
                type="button"
                className={[styles.removeButton, inlineRemoveButton ? styles.inlineRemoveButton : ''].join(' ')}
                tabIndex={-1}
                disabled={element.disabled || element.readonly}
                onClick={element.onDropIndexClick(element.index)}
              >
                <Trash/>
                {inlineRemoveButton ? '' : removeItemTitle}
              </Button>
            )}
          </div>
        ))}
      {props.canAdd && (
        <Button
          type="button"
          className={styles.addButton}
          tabIndex={-1}
          onClick={props.onAddClick}
        >
          <Plus/>
          {addItemTitle}
        </Button>
      )}
    </fieldset>
  )
}

function FieldTemplateBuilder ({ translationHook }) {
  return function FieldTemplate (props) {
    const { id, classNames, style, help, description, errors, children } = props
    const label = props.schema.$id
      ? props.label[props.schema.$id]
      : props.label
    const title = props.schema.$id
      ? props.uiSchema?.['ui:title']?.[props.schema.$id] ?? ''
      : props.uiSchema?.['ui:title'] ?? ''
    return (
      <div className={classNames} style={style}>
        <label htmlFor={id} style={{ display: title === '' ? 'none' : 'block' }}>
          {translationHook(label)}
        </label>
        {description}
        {children}
        {errors}
        {help}
      </div>
    )
  }
}

function ObjectFieldTemplateBuilder ({ translationHook }) {
  return function ObjectFieldTemplate (props) {
    if (props.uiSchema['ui:groups']) {
      const groups = props.uiSchema['ui:groups']
      const groupedElements = groups.map(({ fields, title }) => {
        const elements = fields
          .filter(
            (field) => (props.uiSchema[field] || {})['ui:widget'] !== 'hidden'
          )
          .map((field) => {
            const element = props.properties.find((element) => element.name === field)

            if (!element) {
              console.error('Field configuration not found for "%s" in \'ui:groups\' "%s" — part of %o', field, title, fields)
            }

            return [field, element]
          })

        if (elements && elements.length > 0) {
          return (
            <fieldset className={styles.fieldset} key={fields.join('-')}>
              {title && <legend>{translationHook(title)}</legend>}
              {elements.map(([field, element]) => (
                element
                  ? <Fragment key={field}>{element.content}</Fragment>
                  : <p key={field} className={styles.fieldHasNoElementError}>
                    Field <code>{field}</code> defined in <code>ui:groups</code> is not an
                    entry of <code>data-schema.json[properties]</code> object.
                  </p>
              ))}
            </fieldset>
          )
        }
      })

      return <>{groupedElements}</>
    }

    if (props) {
      const autocomplete = props.uiSchema['ui:autocomplete']
      return (
        <Fragment key={props.key}>
          {props.description}
          {autocomplete === 'IsidoreAuthorSearch' && <IsidoreAuthorAPIAutocompleteField {...props}/>}
          {props.properties.map((element) => (
            <Fragment key={element.name}>{element.content}</Fragment>
          ))}
        </Fragment>
      )
    }
  }
}

export default function SchemaForm ({
  schema,
  uiSchema,
  formData: initialFormData,
  basicMode,
  onChange = () => {
  },
}) {
  const { t } = useTranslation()
  const baseSchema = schema ?? defaultSchema
  const baseUiSchema = uiSchema ?? defaultUiSchema
  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState({})
  const formContext = {
    partialUpdate: ({ id, value }) => {
      const path = id.replace('root_', '').replace('_', '.')
      setFormData((state) => {
        const newFormData = set(state, path, value)
        onChange(toYaml(newFormData))
        return newFormData
      })
    },
  }

  const effectiveUiSchema = useMemo(
    () => (basicMode ? { ...baseUiSchema, ...basicUiSchema } : baseUiSchema),
    [basicMode]
  )

  const customWidgets = {
    SelectWidget: CustomSelectBuilder({ translationHook: t }),
  }

  const customFields = {
    IsidoreKeywordSearch: isidoreKeywordSearch,
    IsidoreAuthorSearch: isidoreAuthorSearch,
  }

  const handleUpdate = useCallback((event) => {
    const formData = event.formData
    setFormData(formData)
    onChange(toYaml(formData))
  }, [setFormData, onChange])

  return (
    <Form
      className={styles.form}
      ObjectFieldTemplate={ObjectFieldTemplateBuilder({ translationHook: t })}
      FieldTemplate={FieldTemplateBuilder({ translationHook: t })}
      ArrayFieldTemplate={ArrayFieldTemplate}
      formContext={formContext}
      schema={baseSchema}
      widgets={customWidgets}
      fields={customFields}
      uiSchema={effectiveUiSchema}
      formData={formData}
      onChange={handleUpdate}
      onError={setErrors}
    >
      <hr hidden={true}/>
    </Form>
  )
}
