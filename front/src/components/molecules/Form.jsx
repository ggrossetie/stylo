import clsx from 'clsx'
import { Plus, Trash } from 'lucide-react'
import { set } from 'object-path-immutable'
import { Fragment, useCallback, useMemo, useState } from 'react'
import { Translation } from 'react-i18next'

import Form, { getDefaultRegistry } from '@rjsf/core'
import validator from '@rjsf/validator-ajv8'

import { Button } from '../atoms/index.js'

import CorpusArticleMetadataSelector from '../organisms/corpus/CorpusArticleMetadataSelector.jsx'
import isidoreAuthorSearch from '../organisms/metadata/isidoreAuthor.jsx'
import IsidoreAuthorAPIAutocompleteField from '../organisms/metadata/isidoreAuthor.jsx'
import isidoreKeywordSearch from '../organisms/metadata/isidoreKeyword.jsx'
// remove once fixed in https://github.com/rjsf-team/react-jsonschema-form/issues/1041
import SelectWidget from './SelectWidget.jsx'
import ToggleWidget from './ToggleWidget.jsx'

// REMIND: use a custom SelectWidget to support "ui:emptyValue"
import styles from './form.module.scss'

const {
  templates: { BaseInputTemplate: DefaultBaseInputTemplate },
  widgets: { CheckboxesWidget },
} = getDefaultRegistry()

/**
 * @param {BaseInputTemplate} properties
 * @returns {JSX.Element}
 */
function BaseInputTemplate(properties) {
  const { placeholder } = properties
  return (
    <Translation ns="form" useSuspense={false}>
      {(t) => (
        <DefaultBaseInputTemplate
          {...properties}
          placeholder={t(placeholder)}
        />
      )}
    </Translation>
  )
}

/**
 * @param {SelectWidget} properties
 * @returns {JSX.Element}
 */
function CustomSelectWidget(properties) {
  const { options, title, placeholder } = properties
  return (
    <div
      className={clsx(
        styles.selectContainer,
        (properties.disabled || properties.readonly) && styles.selectDisabled
      )}
    >
      <Translation ns="form" useSuspense={false}>
        {(t) => (
          <SelectWidget
            {...{
              ...properties,
              placeholder: t(placeholder),
              options: {
                enumOptions: options?.enumOptions?.map((opt) => {
                  if (title && opt.label in title) {
                    return {
                      label: t(title[opt.label]),
                      value: opt.value,
                    }
                  }
                  return {
                    label: t(opt.label),
                    value: opt.value,
                  }
                }),
              },
            }}
          />
        )}
      </Translation>
    </div>
  )
}

/**
 * @param {WidgetProps} properties
 * @returns {JSX.Element}
 */
function CustomCheckboxesWidget(properties) {
  const { options, title } = properties
  return (
    <Translation ns="form" useSuspense={false}>
      {(t) => (
        <CheckboxesWidget
          {...{
            ...properties,
            options: {
              enumOptions: options?.enumOptions?.map((opt) => {
                if (title && opt.label in title) {
                  return {
                    label: t(title[opt.label]),
                    value: opt.value,
                  }
                }
                return {
                  label: t(opt.label),
                  value: opt.value,
                }
              }),
            },
          }}
        />
      )}
    </Translation>
  )
}

function ArrayFieldItemButtonsTemplate(props) {
  console.log({ props })
  const inlineRemoveButton = true
  const removeItemTitle = 'form.itemRemove'
  return (
    <Button
      icon={inlineRemoveButton}
      type="button"
      className={[
        styles.removeButton,
        inlineRemoveButton ? styles.inlineRemoveButton : '',
      ].join(' ')}
      tabIndex={-1}
      disabled={props.disabled || props.readonly}
      onClick={(event) => props.handleRemoveItem(event, props.index)}
    >
      <Trash />
      {inlineRemoveButton ? (
        ''
      ) : (
        <Translation ns="form" useSuspense={false}>
          {(t) => t(removeItemTitle)}
        </Translation>
      )}
    </Button>
  )
}

function ArrayFieldItemTemplate(props) {
  console.log({ props })
  const { children, itemKey, itemUiSchema, className } = props
  console.log('ArrayFieldItemTemplate', { props })
  console.log({ butpros: props.buttonsProps })
  return (
    <div
      id={itemKey}
      key={itemKey}
      className={clsx(
        className,
        'can-add-remove',
        itemUiSchema['ui:className']
      )}
    >
      {children}
      {props.registry.templates.ArrayFieldItemButtonsTemplate(props)}
    </div>
  )
}

function ArrayFieldTemplate(props) {
  return (
    <div>
      {props.items.map((element) => element.children)}
      {props.canAdd && (
        <button type="button" onClick={props.onAddClick}></button>
      )}
    </div>
  )
}

/**
 * @param {ArrayFieldTemplateProps} properties
 * @returns {JSX.Element}
 */
/*
function ArrayFieldTemplate(properties) {
  console.log({ properties })
  const addItemTitle =
    properties.uiSchema['ui:add-item-title'] ?? 'form.itemAdd'
  const removeItemTitle =
    properties.uiSchema['ui:remove-item-title'] ?? 'form.itemRemove'
  const title = properties.uiSchema['ui:title']
  const inlineRemoveButton =
    properties.schema?.items?.type === 'string' || !removeItemTitle
  const items = [...properties.items].reverse()
  return (
    <fieldset
      className={clsx(styles.fieldset, styles.rjsfFieldArray)}
      key={properties.itemKey}
    >
      {title && (
        <Translation ns="form" useSuspense={false}>
          {(t) => <legend id={properties.id}>{t(title)}</legend>}
        </Translation>
      )}
      {properties.canAdd && (
        <Button
          disabled={properties.disabled || properties.readonly}
          type="button"
          className={styles.addButton}
          tabIndex={-1}
          onClick={properties.onAddClick}
        >
          <Plus />
          <Translation ns="form" useSuspense={false}>
            {(t) => t(addItemTitle)}
          </Translation>
        </Button>
      )}
      {items?.map((element) => {
        return <div key={element.props.itemKey}>{element.children}</div>
      })}
    </fieldset>
  )
}
*/
function FieldTemplate(properties) {
  const {
    id,
    classNames,
    style,
    help,
    description,
    errors,
    children,
    displayLabel,
  } = properties
  const label = properties.schema.$id
    ? properties.label[properties.schema.$id]
    : properties.label

  if (properties.hidden) {
    return <></>
  }
  return (
    <div className={classNames} style={style}>
      {displayLabel && (
        <label htmlFor={id}>
          <Translation ns="form" useSuspense={false}>
            {(t) => <>{t(label)}</>}
          </Translation>
        </label>
      )}
      {description}
      {children}
      {errors}
      {help}
    </div>
  )
}

const customFields = {
  IsidoreKeywordSearch: isidoreKeywordSearch,
  IsidoreAuthorSearch: isidoreAuthorSearch,
}

const customWidgets = {
  SelectWidget: CustomSelectWidget,
  CheckboxesWidget: CustomCheckboxesWidget,
  toggle: ToggleWidget,
}

const EMPTY_CONTEXT = {}

/**
 * @param {object} props properties
 * @param {Record<string, unknown>} props.formData
 * @param {boolean} props.readOnly
 * @param {Record<string, unknown>} props.schema
 * @param {Record<string, unknown>} props.uiSchema
 * @param {(formData: Record<string, unknown>) => void} props.onChange
 * @param {Record<string, unknown>} props.context
 * @returns {Element}
 */
export default function SchemaForm({
  formData: initialFormData,
  readOnly,
  schema,
  uiSchema,
  onChange = () => {},
  context = EMPTY_CONTEXT,
}) {
  const [formData, setFormData] = useState(initialFormData)
  const [, setErrors] = useState({})
  const formContext = useMemo(
    () => ({
      partialUpdate: ({ id, value }) => {
        const path = id.replace('root', '').replace(/^_/, '').replace('_', '.')
        setFormData((state) => {
          const newFormData = set(state, path, value)
          onChange(newFormData)
          return newFormData
        })
      },
    }),
    [onChange, setFormData]
  )

  const customTemplates = useMemo(
    () => ({
      FieldTemplate,
      BaseInputTemplate,
      ArrayFieldItemButtonsTemplate,
    }),
    [context]
  )

  const handleUpdate = useCallback(
    (event) => {
      const formData = event.formData
      setFormData(formData)
      onChange(formData)
    },
    [setFormData, onChange]
  )

  // noinspection JSValidateTypes
  return (
    <Form
      readonly={readOnly}
      className={styles.form}
      formContext={formContext}
      schema={schema}
      name="Metadata"
      templates={customTemplates}
      widgets={customWidgets}
      fields={customFields}
      uiSchema={uiSchema}
      formData={formData}
      onChange={handleUpdate}
      onError={setErrors}
      validator={validator}
    >
      <hr hidden={true} />
    </Form>
  )
}
