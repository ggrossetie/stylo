import { useSelector } from 'react-redux'
import useGraphQL, { useMutateData } from './graphql.js'
import {
  getEditableArticle as getEditableArticleQuery,
  getArticleVersions as getArticleVersionsQuery,
} from '../components/Write/Write.graphql'
import { updateWorkingVersion } from '../services/ArticleService.graphql'
import { executeQuery } from '../helpers/graphQL.js'
import {
  duplicateArticle,
  renameArticle,
  deleteArticle,
} from '../components/Article.graphql'

import {
  addTags,
  removeTags,
  getArticleTags,
} from '../components/Article.graphql'
import useFetchData from './graphql.js'

export function useArticleTagActions({ articleId }) {
  const sessionToken = useSelector((state) => state.sessionToken)
  const { data, mutate, error, isLoading } = useFetchData(
    { query: getArticleTags, variables: { articleId } },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )
  const add = async (tagId) => {
    const result = await executeQuery({
      query: addTags,
      variables: {
        articleId,
        tags: [tagId],
      },
      sessionToken,
      type: 'mutation',
    })
    const tags = result.article.addTags
    mutate(
      {
        article: {
          tags,
        },
      },
      { revalidate: false }
    )
    return tags
  }
  const remove = async (tagId) => {
    const result = await executeQuery({
      query: removeTags,
      variables: {
        articleId,
        tags: [tagId],
      },
      sessionToken,
      type: 'mutation',
    })
    const tags = result.article.removeTags
    mutate(
      {
        article: {
          tags,
        },
      },
      { revalidate: false }
    )
    return tags
  }

  return {
    tags: data?.article?.tags || [],
    isLoading,
    error,
    add,
    remove,
  }
}

export function useArticleActions({ articleId }) {
  const sessionToken = useSelector((state) => state.sessionToken)
  const activeUser = useSelector((state) => state.activeUser)
  const copy = async (toUserId) => {
    return await executeQuery({
      query: duplicateArticle,
      variables: {
        user: null,
        to: toUserId,
        articleId,
      },
      sessionToken,
      type: 'mutation',
    })
  }
  const duplicate = async () => {
    return await executeQuery({
      query: duplicateArticle,
      variables: {
        user: activeUser._id,
        to: activeUser._id,
        articleId,
      },
      sessionToken,
      type: 'mutation',
    })
  }
  const rename = async (title) => {
    return await executeQuery({
      query: renameArticle,
      variables: { user: activeUser._id, articleId, title },
      sessionToken,
      type: 'mutation',
    })
  }
  const remove = async () => {
    return await executeQuery({
      query: deleteArticle,
      variables: { articleId },
    })
  }

  return {
    copy,
    duplicate,
    rename,
    remove,
  }
}

export function useArticleWorkingCopyActions({ articleId }) {
  const userId = useSelector((state) => state.activeUser._id)
  const { mutate } = useMutateData({
    query: getEditableArticleQuery,
    variables: {
      user: userId,
      article: articleId,
      version: 'latest',
      hasVersion: false,
    },
  })
  const updateMetadata = async (metadata) => {
    const result = await executeQuery({
      query: updateWorkingVersion,
      variables: {
        articleId,
        content: {
          metadata: metadata,
        },
      },
    })
    await mutate(async (data) => {
      return {
        article: {
          ...data.article,
          updatedAt: result.article.updateWorkingVersion.updatedAt,
          workingVersion: {
            ...data.article.workingVersion,
            metadata: metadata,
          },
        },
      }
    })
  }

  return {
    updateMetadata,
  }
}

export function useArticle({ articleId, version }) {
  const userId = useSelector((state) => state.activeUser._id)
  const { data, error, isLoading, mutate } = useGraphQL(
    {
      query: getEditableArticleQuery,
      variables: {
        user: userId,
        article: articleId,
        version: version || 'latest',
        hasVersion: typeof version === 'string',
      },
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )
  const content =
    version && data?.version
      ? {
          bib: data?.version.bib,
          md: data?.version.md,
          metadata: data?.version.metadata,
          bibPreview: data?.version.bibPreview,
          version: {
            message: data?.version.message,
            major: data?.version.version,
            minor: data?.version.revision,
          },
        }
      : data?.article?.workingVersion

  const updateText = async (text) => {
    const result = await executeQuery({
      query: updateWorkingVersion,
      variables: {
        articleId,
        content: {
          md: text,
        },
      },
    })
    await mutate(async (data) => {
      return {
        article: {
          ...data.article,
          updatedAt: result.article.updateWorkingVersion.updatedAt,
          workingVersion: {
            ...data.article.workingVersion,
            md: text,
          },
        },
      }
    })
  }

  return {
    updateText,
    content,
    article: data?.article,
    error,
    isLoading,
  }
}

export function useArticleVersion({ articleId }) {
  const { data, error, isLoading } = useGraphQL(
    {
      query: getArticleVersionsQuery,
      variables: {
        article: articleId,
      },
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  return {
    article: data?.article,
    error,
    isLoading,
  }
}
