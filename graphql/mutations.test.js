const { graphql } = require('graphql')
const schema = require('./schema.js')
const User = require('./models/user.js')
const Version = require('./models/version.js')
const { createLoaders } = require('./loaders.js')

const { after, before, describe, test } = require('node:test')
const assert = require('node:assert')
const { setup, teardown } = require('./tests/harness.js')

describe('mutations', () => {
  let container
  let user
  let context

  /**
   * Execute a GraphQL operation as the authenticated user.
   * @param {string} source
   * @param {Record<string, any>} [variableValues]
   * @returns {Promise<Record<string, any>>}
   */
  async function execute(source, variableValues) {
    const { data, errors } = await graphql({
      schema,
      source,
      variableValues,
      contextValue: { ...context, loaders: createLoaders() },
    })
    assert.equal(errors, undefined, JSON.stringify(errors))
    return data
  }

  before(async () => {
    container = await setup()
    user = await User.create({
      email: 'mutations@huma-num.fr',
      username: 'mutations',
      password: 'p4ssw0rd',
    })
    context = { user, userId: user.id, token: { _id: user.id } }
  })

  after(async () => {
    await teardown(container)
  })

  test('createUser', async () => {
    const data = await execute(
      `mutation ($input: CreateUserInput!) { createUser(input: $input) { email } }`,
      {
        input: {
          email: 'new-user@huma-num.fr',
          username: 'new-user',
          password: 'p4ssw0rd',
        },
      }
    )
    assert.equal(data.createUser.email, 'new-user@huma-num.fr')
  })

  test('changePassword and updateUser', async () => {
    await execute(
      `mutation ($input: ChangePasswordInput!) { changePassword(input: $input) { _id } }`,
      { input: { currentPassword: 'p4ssw0rd', newPassword: 'n3wp4ssw0rd' } }
    )
    const updatedUser = await User.findById(user.id)
    assert.ok(await updatedUser.comparePassword('n3wp4ssw0rd'))

    const data = await execute(
      `mutation ($input: UpdateUserInput!) { updateUser(input: $input) { displayName } }`,
      { input: { displayName: 'Jane' } }
    )
    assert.equal(data.updateUser.displayName, 'Jane')
  })

  test('createTag and updateTag', async () => {
    const { createTag } = await execute(
      `mutation ($input: CreateTagInput!) { createTag(input: $input) { _id name } }`,
      { input: { name: 'Tag', color: '#f4a261' } }
    )
    assert.equal(createTag.name, 'Tag')

    const { updateTag } = await execute(
      `mutation ($tagId: ID!, $input: UpdateTagInput!) {
        updateTag(tagId: $tagId, input: $input) { name color }
      }`,
      { tagId: createTag._id, input: { name: 'Renamed' } }
    )
    assert.deepEqual(updateTag, { name: 'Renamed', color: '#f4a261' })
  })

  test('article mutations', async () => {
    const { createArticle } = await execute(
      `mutation ($input: CreateArticleInput!) { createArticle(input: $input) { _id } }`,
      { input: { title: 'Article' } }
    )
    const articleId = createArticle._id

    const { updateArticle } = await execute(
      `mutation ($articleId: ID!, $input: UpdateArticleInput!) {
        updateArticle(articleId: $articleId, input: $input) { title }
      }`,
      { articleId, input: { title: 'Updated article' } }
    )
    assert.equal(updateArticle.title, 'Updated article')

    const { updateArticleBibliography } = await execute(
      `mutation ($articleId: ID!, $input: UpdateArticleBibliographyInput!) {
        updateArticleBibliography(articleId: $articleId, input: $input) { key }
      }`,
      { articleId, input: { bib: '@book{key, title={Title}}' } }
    )
    assert.deepEqual(updateArticleBibliography, [{ key: 'key' }])

    const { updateArticleMetadata } = await execute(
      `mutation ($articleId: ID!, $input: UpdateArticleMetadataInput!) {
        updateArticleMetadata(articleId: $articleId, input: $input) {
          workingVersion { metadata }
        }
      }`,
      { articleId, input: { metadata: { title: 'Metadata title' } } }
    )
    assert.deepEqual(updateArticleMetadata.workingVersion.metadata, {
      title: 'Metadata title',
    })

    const { setArticlePreviewSettings } = await execute(
      `mutation ($articleId: ID!, $input: SetArticlePreviewSettingsInput!) {
        setArticlePreviewSettings(articleId: $articleId, input: $input) {
          preview { template }
        }
      }`,
      { articleId, input: { template: 'template.html' } }
    )
    assert.equal(setArticlePreviewSettings.preview.template, 'template.html')

    const { updateArticleWorkingVersion } = await execute(
      `mutation ($articleId: ID!, $input: UpdateArticleWorkingVersionInput!) {
        updateArticleWorkingVersion(articleId: $articleId, input: $input) {
          workingVersion { metadataFormType }
        }
      }`,
      { articleId, input: { metadataFormType: 'custom' } }
    )
    assert.equal(
      updateArticleWorkingVersion.workingVersion.metadataFormType,
      'custom'
    )

    const { createArticleVersion } = await execute(
      `mutation ($articleId: ID!, $input: CreateArticleVersionInput!) {
        createArticleVersion(articleId: $articleId, input: $input) {
          versions { _id message }
        }
      }`,
      { articleId, input: { major: true, message: 'v1' } }
    )
    const [version] = createArticleVersion.versions
    assert.equal(version.message, 'v1')
    const { owner } = await Version.findById(version._id)
    assert.equal(owner.toString(), user.id)
  })

  test('workspace mutations', async () => {
    const { createWorkspace } = await execute(
      `mutation ($input: CreateWorkspaceInput!) { createWorkspace(input: $input) { _id name } }`,
      { input: { name: 'Workspace', color: '#f4a261' } }
    )
    assert.equal(createWorkspace.name, 'Workspace')

    const { updateWorkspaceFormMetadata } = await execute(
      `mutation ($workspaceId: ID!, $input: UpdateWorkspaceFormMetadataInput!) {
        updateWorkspaceFormMetadata(workspaceId: $workspaceId, input: $input) {
          formMetadata { data }
        }
      }`,
      { workspaceId: createWorkspace._id, input: { data: '{"title":"book"}' } }
    )
    assert.equal(
      updateWorkspaceFormMetadata.formMetadata.data,
      '{"title":"book"}'
    )
  })

  test('corpus mutations', async () => {
    const articleIds = []
    for (const title of ['First', 'Second']) {
      const { createArticle } = await execute(
        `mutation ($input: CreateArticleInput!) { createArticle(input: $input) { _id } }`,
        { input: { title } }
      )
      articleIds.push(createArticle._id)
    }

    const { createCorpus } = await execute(
      `mutation ($input: CreateCorpusInput!) { createCorpus(input: $input) { _id name } }`,
      { input: { name: 'Corpus', type: 'neutral' } }
    )
    const corpusId = createCorpus._id

    const { updateCorpus } = await execute(
      `mutation ($corpusId: ID!, $input: UpdateCorpusInput!) {
        updateCorpus(corpusId: $corpusId, input: $input) { name }
      }`,
      { corpusId, input: { name: 'Renamed corpus' } }
    )
    assert.equal(updateCorpus.name, 'Renamed corpus')

    const { setCorpusArticles } = await execute(
      `mutation ($corpusId: ID!, $input: SetCorpusArticlesInput!) {
        setCorpusArticles(corpusId: $corpusId, input: $input) {
          articles { article { _id } }
        }
      }`,
      { corpusId, input: { articleIds } }
    )
    assert.deepEqual(
      setCorpusArticles.articles.map((a) => a.article._id),
      articleIds
    )

    const { updateCorpusArticlesOrder } = await execute(
      `mutation ($corpusId: ID!, $input: UpdateCorpusArticlesOrderInput!) {
        updateCorpusArticlesOrder(corpusId: $corpusId, input: $input) {
          articles { article { _id } }
        }
      }`,
      {
        corpusId,
        input: {
          articlesOrder: [
            { articleId: articleIds[0], order: 2 },
            { articleId: articleIds[1], order: 1 },
          ],
        },
      }
    )
    assert.deepEqual(
      updateCorpusArticlesOrder.articles.map((a) => a.article._id),
      [articleIds[1], articleIds[0]]
    )
  })
})
