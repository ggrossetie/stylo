import PropTypes from 'prop-types'
import React from 'react'
import ArticleStats from '../../../ArticleStats.jsx'
import MonacoTextEditor from './TextEditor'
import MonacoDiffEditor from './DiffEditor'

export default function Editor ({
  text,
  articleId,
  selectedVersion,
  compareTo,
  currentArticleVersion,
  readOnly,
  onTextUpdate,
}) {
  if (compareTo) {
    return <MonacoDiffEditor
      text={text}
      articleId={articleId}
      selectedVersion={selectedVersion}
      compareTo={compareTo}
      currentArticleVersion={currentArticleVersion}
      readOnly={readOnly}
      onTextUpdate={onTextUpdate}
    />
  }
  return (
    <>
      <MonacoTextEditor
        text={text}
        readOnly={readOnly}
        onTextUpdate={onTextUpdate}/>
      <ArticleStats/>
    </>
  )
}

Editor.propTypes = {
  text: PropTypes.string,
  articleId: PropTypes.string,
  selectedVersion: PropTypes.string,
  compareTo: PropTypes.string,
  currentArticleVersion: PropTypes.string,
  readOnly: PropTypes.bool,
  onTextUpdate: PropTypes.func,
}
