import {
  ArrowLeftToLine,
  ArrowRightToLine,
  BookKey,
  Database,
  History,
  ListChecks,
  MessageSquareShare,
  Printer,
  TableOfContents,
  TextCursorInput,
} from 'lucide-react'
import { useCallback, useImperativeHandle, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { usePreferenceItem } from '../../../hooks/user.js'
import styles from './EditorMenu.module.scss'
import EditorMenuItem from './EditorMenuItem.jsx'

export default function EditorMenu({
  articleId,
  onChange,
  onNavigateLeft,
  menuRef,
}) {
  const enableNakala = useMemo(
    () => !window.location.href.startsWith('https://stylo.huma-num.fr/'),
    []
  ) // disable Nakala in production
  const { t } = useTranslation()
  const { value: minimized, setValue: setMinimized } = usePreferenceItem(
    'minimized',
    'article'
  )
  const { value: activeMenu, setValue: setActiveMenu } = usePreferenceItem(
    `${articleId}.activeMenu`,
    'article'
  )

  const handleAnnotate = useCallback(
    () => window.open(`${location.pathname}/annotate`, '_blank').focus(),
    []
  )

  const toggleActiveMenu = useCallback(
    (name) => () => {
      const value = activeMenu === name ? '' : name
      setActiveMenu(value)
      onChange(value)
    },
    [activeMenu, onChange, setActiveMenu]
  )

  const itemRefs = useRef({})
  const itemsRef = useRef(null)
  const lastFocusedItemRef = useRef(null)

  useImperativeHandle(menuRef, () => ({
    focusItem: (name) => itemRefs.current[name]?.focus(),
    focus: () => {
      if (lastFocusedItemRef.current?.isConnected) {
        lastFocusedItemRef.current.focus()
      } else {
        itemsRef.current?.querySelector('button')?.focus()
      }
    },
  }))

  const setItemRef = useCallback(
    (name) => (element) => {
      itemRefs.current[name] = element
    },
    []
  )

  // ArrowLeft moves focus leftward: into the open panel, or to the editor
  const handleItemKeyDown = useCallback(
    (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        onNavigateLeft?.()
      }
    },
    [onNavigateLeft]
  )

  return (
    <div className={styles.menu}>
      <button
        type="button"
        className={styles.toggleMinimized}
        onClick={() => setMinimized(!minimized)}
      >
        {!minimized && <span>{t('menu.collapse.text')}</span>}
        <span
          title={minimized ? t('menu.expand.title') : t('menu.collapse.title')}
        >
          {minimized ? <ArrowLeftToLine /> : <ArrowRightToLine />}
        </span>
      </button>
      <div
        ref={itemsRef}
        className={styles.items}
        onFocus={(event) => {
          lastFocusedItemRef.current = event.target
        }}
      >
        <EditorMenuItem
          buttonRef={setItemRef('toc')}
          onClick={toggleActiveMenu('toc')}
          onKeyDown={handleItemKeyDown}
          selected={activeMenu === 'toc'}
          minimized={minimized}
          icon={<TableOfContents />}
          text={t('toc.title')}
        />
        <EditorMenuItem
          buttonRef={setItemRef('metadata')}
          onClick={toggleActiveMenu('metadata')}
          onKeyDown={handleItemKeyDown}
          selected={activeMenu === 'metadata'}
          minimized={minimized}
          icon={<TextCursorInput />}
          text={t('metadata.title')}
        />
        <EditorMenuItem
          buttonRef={setItemRef('bibliography')}
          onClick={toggleActiveMenu('bibliography')}
          onKeyDown={handleItemKeyDown}
          selected={activeMenu === 'bibliography'}
          minimized={minimized}
          icon={<BookKey />}
          text={t('bibliography.title')}
        />
        {enableNakala && (
          <EditorMenuItem
            buttonRef={setItemRef('data')}
            onClick={toggleActiveMenu('data')}
            onKeyDown={handleItemKeyDown}
            selected={activeMenu === 'data'}
            minimized={minimized}
            icon={<Database />}
            text={t('data.title')}
          />
        )}
        <EditorMenuItem
          buttonRef={setItemRef('versions')}
          onClick={toggleActiveMenu('versions')}
          onKeyDown={handleItemKeyDown}
          selected={activeMenu === 'versions'}
          minimized={minimized}
          icon={<History />}
          text={t('versions.title')}
        />
        <EditorMenuItem
          buttonRef={setItemRef('export')}
          onClick={toggleActiveMenu('export')}
          onKeyDown={handleItemKeyDown}
          selected={activeMenu === 'export'}
          minimized={minimized}
          icon={<Printer />}
          text={t('export.title')}
        />
        <EditorMenuItem
          buttonRef={setItemRef('validation')}
          onClick={toggleActiveMenu('validation')}
          onKeyDown={handleItemKeyDown}
          selected={activeMenu === 'validation'}
          minimized={minimized}
          icon={<ListChecks />}
          text={t('validation.title')}
        />
        <EditorMenuItem
          onClick={handleAnnotate}
          selected={activeMenu === 'annotate'}
          minimized={minimized}
          icon={<MessageSquareShare />}
          text={t('annotate.title')}
          external={true}
        />
      </div>
    </div>
  )
}
