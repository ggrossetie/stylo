import clsx from 'clsx'
import PropTypes from 'prop-types'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import slugify from 'slugify'
import { applicationConfig } from '../config.js'
import useStyloExport from '../hooks/stylo-export.js'
import buttonStyles from './button.module.scss'
import styles from './export.module.scss'
import formStyles from './form.module.scss'
import Loading from './Loading'

import Select from './Select'
import Combobox from './SelectCombobox.jsx'

/**
 *
 * @param {boolean} booleanValue
 * @return {number}
 */
function toNumber(booleanValue) {
  return booleanValue ? 1 : 0
}

// https://export.stylo-dev.huma-num.fr/generique/article/stylo-dev.huma-num.fr/5e32d54e4f58270018f9d251/test/?with_toc=0&with_ascii=0&with_link_citations=1&with_nocite=1
export default function Export({
  bookId,
  articleVersionId,
  articleId,
  bib,
  name,
}) {
  const { processEndpoint, exportEndpoint, pandocExportEndpoint } =
    applicationConfig
  const [format, setFormat] = useState(bookId ? 'html5' : 'html')
  const [csl, setCsl] = useState('chicagomodified')
  const [withToc, setWithToc] = useState(false)
  const [withNocite, setWithNocite] = useState(false)
  const [withLinkCitations, setWithLinkCitations] = useState(false)
  const [unnumbered, setUnnumbered] = useState('false')
  const [tld, setTld] = useState('false')
  const { exportFormats, exportStyles, exportStylesPreview, isLoading } =
    useStyloExport({ csl, bib })
  const { host } = window.location
  const exportId = useMemo(
    () =>
      slugify(name, { strict: true, lower: true }) ||
      (articleVersionId ?? articleId ?? bookId),
    [name]
  )
  const { t } = useTranslation()
  const groupedExportStyles = useMemo(() => {
    return exportStyles?.map(({ key, name }, index) => ({
      key,
      name,
      section: '',
      // pre-assign an index to each entry. It will persist upon filtered results.
      // @see https://github.com/EcrituresNumeriques/stylo/issues/1014
      index,
    }))
  }, [exportStyles])

  const exportUrl = bookId
    ? `${processEndpoint}/cgi-bin/exportBook/exec.cgi?id=${exportId}&book=${bookId}&processor=xelatex&source=${exportEndpoint}/&format=${format}&bibstyle=${csl}&toc=${withToc}&tld=${tld}&unnumbered=${unnumbered}`
    : `${pandocExportEndpoint}/generique/article/export/${host}/${articleId}/${exportId}/?with_toc=${toNumber(
        withToc
      )}&with_link_citations=${toNumber(
        withLinkCitations
      )}&with_nocite=${toNumber(
        withNocite
      )}&with_ascii=0&bibliography_style=${csl}&formats=originals&formats=${format}&version=${
        articleVersionId ?? ''
      }`

  return (
    <section className={styles.export}>
      <form className={clsx(formStyles.form, formStyles.verticalForm)}>
        {articleId && !exportFormats.length && <Loading inline size="24" />}
        {articleId && exportFormats.length && (
          <Select
            id="export-formats"
            label={t('export.format.label')}
            value={format}
            onChange={(e) => setFormat(e.target.value)}
          >
            {exportFormats.map(({ key, name }) => (
              <option value={key} key={key}>
                {name}
              </option>
            ))}
          </Select>
        )}
        {bookId && (
          <Select
            id="export-formats"
            label={t('export.format.label')}
            value={format}
            onChange={(e) => setFormat(e.target.value)}
          >
            <option value="html5">HTML5</option>
            <option value="zip">ZIP</option>
            <option value="pdf">PDF</option>
            <option value="tex">LATEX</option>
            <option value="xml">XML (érudit)</option>
            <option value="odt">ODT</option>
            <option value="docx">DOCX</option>
            <option value="epub">EPUB</option>
            <option value="tei">TEI</option>
            <option value="icml">ICML</option>
          </Select>
        )}
        {articleId && bib && !exportStyles.length && (
          <Loading inline size="24" />
        )}
        {articleId && bib && exportStyles.length && (
          <Combobox
            id="export-styles"
            label={t('export.bibliographyStyle.label')}
            items={groupedExportStyles}
            value={csl}
            onChange={setCsl}
          />
        )}
        {articleId && bib && (
          <div className={styles.bibliographyPreview}>
            {isLoading && <Loading inline size="24" />}
            {!isLoading && (
              <div dangerouslySetInnerHTML={{ __html: exportStylesPreview }} />
            )}
          </div>
        )}
        {bookId && bib && (
          <Select
            id="export-styles"
            label={t('export.bibliographyStyle.label')}
            value={csl}
            setCsl={setCsl}
          >
            <option value="chicagomodified">chicagomodified</option>
            <option value="lettres-et-sciences-humaines-fr">
              lettres-et-sciences-humaines-fr
            </option>
            <option value="chicago-fullnote-bibliography-fr">
              chicago-fullnote-bibliography-fr
            </option>
          </Select>
        )}
        {bookId && (
          <Select
            id="export-numbering"
            label={t('export.sectionChapters.label')}
            value={unnumbered}
            onChange={(e) => setUnnumbered(e.target.value)}
          >
            <option value="false">
              {t('export.sectionChapters.numbered')}
            </option>
            <option value="true">
              {t('export.sectionChapters.unnumbered')}
            </option>
          </Select>
        )}
        {bookId && (
          <Select
            id="export-book-division"
            label={t('export.bookDivision.label')}
            value={tld}
            onChange={(e) => setTld(e.target.value)}
          >
            <option value="part">{t('export.bookDivision.part')}</option>
            <option value="chapter">{t('export.bookDivision.chapter')}</option>
          </Select>
        )}
        <label className={styles.checkbox} htmlFor="with-toc">
          <input
            id="with-toc"
            name={name}
            value="1"
            checked={withToc}
            type="checkbox"
            onChange={(e) => {
              setWithToc(e.target.checked)
            }}
          />
          {t('export.options.withToc')}
        </label>
        <label className={styles.checkbox} htmlFor="with-link-citations">
          <input
            id="with-link-citations"
            name={name}
            value="1"
            checked={withLinkCitations}
            type="checkbox"
            onChange={(e) => {
              setWithLinkCitations(e.target.checked)
            }}
          />
          {t('export.options.withLinkCitations')}
        </label>
        <label className={styles.checkbox} htmlFor="with-nocite">
          <input
            id="with-nocite"
            name={name}
            value="1"
            checked={withNocite}
            type="checkbox"
            onChange={(e) => {
              setWithNocite(e.target.checked)
            }}
          />
          {t('export.options.withNocite')}
        </label>
      </form>

      <nav className={styles.actions}>
        <a
          className={clsx(buttonStyles.button, buttonStyles.primary)}
          href={exportUrl}
          rel="noreferrer noopener"
          target="_blank"
          role="button"
        >
          {t('export.submitForm.button')}
        </a>
      </nav>
    </section>
  )
}

// TODO use "shapes" to either have bookId, or articleId, or articleId and articleVersionId
Export.propTypes = {
  bookId: PropTypes.string,
  articleVersionId: PropTypes.string,
  articleId: PropTypes.string,
  name: PropTypes.string.isRequired,
  bib: PropTypes.string,
}
