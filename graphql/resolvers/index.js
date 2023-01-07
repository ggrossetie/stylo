const { User, Query: UserQuery, Mutation: UserMutation } = require('./userResolver');
const { Article, Query: ArticleQuery, Mutation: ArticleMutation } = require('./articleResolver')
const { Tag, Query: TagQuery, Mutation: TagMutation } = require('./tagResolver')
const { Version, Query: VersionQuery, Mutation: VersionMutation } = require('./versionResolver')
const { Group, Query: WorkspaceQuery, Mutation: WorkspaceMutation } = require('./workspaceResolver')
const { Mutation: AuthMutation } = require('./authResolver')

module.exports = {
  User,
  Article,
  Tag,
  Version,
  Group,
  Query: {
    ...UserQuery,
    ...ArticleQuery,
    ...TagQuery,
    ...VersionQuery,
    ...WorkspaceQuery,
  },
  Mutation: {
    ...UserMutation,
    ...ArticleMutation,
    ...TagMutation,
    ...VersionMutation,
    ...AuthMutation,
    ...WorkspaceMutation,
  }
}
