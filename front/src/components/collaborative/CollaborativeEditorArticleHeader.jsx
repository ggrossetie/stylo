import { Loading, Popover, Link } from '@geist-ui/core'
import { Drawer } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { HistoryIcon } from '@primer/octicons-react'
import PropTypes from 'prop-types'
import React, { useCallback } from 'react'
import { AlignLeft } from 'react-feather'
import { useDispatch, useSelector } from 'react-redux'

import useGraphQL from '../../hooks/graphql.js'
import { getArticleInfo } from '../Article.graphql'
import Button from '../Button.jsx'
import ArticleVersionsTimeline from './ArticleVersionsTimeline.jsx'

import styles from './CollaborativeEditorArticleHeader.module.scss'


export default function CollaborativeEditorArticleHeader ({ articleId, onDrawer }) {
  const [opened, { open, close }] = useDisclosure(false)
  const dispatch = useDispatch()
  const articleStructure = useSelector(state => state.articleStructure)
  const { data, isLoading } = useGraphQL({ query: getArticleInfo, variables: { articleId } }, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  })

  const handleDrawerOpen = useCallback(() => {
    open()
    onDrawer(true)
  }, [])

  const handleDrawerClose = useCallback(() => {
    close()
    onDrawer(false)
  }, [])

  const handleTableOfContentsEntryClicked = useCallback(({ target }) => {
    dispatch({ type: 'UPDATE_EDITOR_CURSOR_POSITION', lineNumber: parseInt(target.dataset.index, 10), column: 0 })
  }, [])

  if (isLoading) {
    return <Loading/>
  }

  const content = () => (
    <>
      {articleStructure.map((item) => (
        <Popover.Item key={`line-${item.index}-${item.line}`} tabIndex={0}>
          <Link href="#" data-index={item.index} onClick={handleTableOfContentsEntryClicked}>{item.title}</Link>
        </Popover.Item>
      ))}
    </>
  )

  return (<header className={styles.header}>
    <h1 className={styles.title}>
      <Popover className={styles.tocTooltip} placement="bottomStart" content={content}>
        <AlignLeft/>
      </Popover>
      {data?.article?.title}
    </h1>
    <div className={styles.actions}>
      <Button title="Download a printable version" onClick={handleDrawerOpen}>
        <HistoryIcon/> Versions
      </Button>
    </div>
    <Drawer overlayProps={{ opacity: 0, blur: 0 }} opened={opened} onClose={handleDrawerClose} size={300}>
      <ArticleVersionsTimeline></ArticleVersionsTimeline>
    </Drawer>
  </header>)
}

CollaborativeEditorArticleHeader.propTypes = {
  articleId: PropTypes.string.isRequired
}
