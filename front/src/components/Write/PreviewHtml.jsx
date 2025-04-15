import React from 'react'

import { useStyloExportPreview } from '../../hooks/stylo-export.js'
import Loading from '../molecules/Loading.jsx'

export default function HtmlPreview({ text, metadata, bibliography }) {
  const { html: __html, isLoading } = useStyloExportPreview({
    md_content: text,
    yaml_content: metadata,
    bib_content: bibliography,
  })

  console.log(__html, isLoading)

  if (isLoading) {
    return <Loading />
  }

  return <section dangerouslySetInnerHTML={{ __html }} />
}
