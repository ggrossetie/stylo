import askGraphQL from "../helpers/graphQL"

const saveVersionQuery = `mutation($userId: ID!, $articleId: ID!, $md: String!, $bib: String!, $yaml: String!, $autosave: Boolean!, $major: Boolean!, $message: String) {
  saveVersion(
    version: {
      article: $articleId,
      major: $major,
      auto: $autosave,
      md: $md,
      yaml: $yaml,
      bib: $bib,
      message: $message
    },
    user: $userId
  ) { 
    _id 
    version
    revision
    message
    autosave
    updatedAt
    owner { 
      displayName
    }
  }
}`

export default class VersionService {

  constructor (userId, articleId, applicationConfig) {
    this.userId = userId
    this.articleId = articleId
    this.applicationConfig = applicationConfig
  }

  async updateCurrentVersion (md, bib, yaml) {
    return await askGraphQL(
      {
        query: saveVersionQuery,
        variables: {
          userId: this.userId,
          articleId: this.articleId,
          md,
          bib,
          yaml,
          autosave: true,
          major: false,
          message: 'Current version'
        }
      },
      `Updating current version on article id: ${this.articleId} (userId: ${this.userId})`,
      '',
      this.applicationConfig
    )
  }

  async saveNewVersion (md, bib, yaml, major = false, message = '') {
    return await askGraphQL(
      {
        query: saveVersionQuery,
        variables: {
          userId: this.userId,
          articleId: this.articleId,
          md,
          bib,
          yaml,
          autosave: false,
          major,
          message
        }
      },
      `Saving a new version on article id: ${this.articleId} (userId: ${this.userId})`,
      '',
      this.applicationConfig
    )
  }
}
