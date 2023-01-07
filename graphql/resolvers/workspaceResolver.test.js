const { MongoMemoryServer } = require('mongodb-memory-server')
const mongoose = require('mongoose')
const { ObjectId } = require('mongoose').Types
const { Query, Mutation } = require('./workspaceResolver')

let mongodb
beforeEach(async () => {
  mongod = await MongoMemoryServer.create()
  const uri = mongod.getUri()
  mongoose.set('useNewUrlParser', true)
  mongoose.set('useUnifiedTopology', true)
  mongoose.set('useCreateIndex', true)
  await (new Promise((resolve, reject) => {
    mongoose
      .connect(uri)
      .then(() => {
        resolve({})
      })
      .catch(err => {
        reject(err)
      })
  }))
})

afterEach(async () => {
  // The Server can be stopped again with
  if (mongod) {
    await mongod.stop()
  }
})

describe('workspace resolver', () => {
  test('create a workspace', async () => {
    const user = { user: { admin: false, id: '5a5b345f98f048281d88eac2', _id: '5a5b345f98f048281d88eac2' } }
    let workspaces = await Query.workspaces({}, {}, user)
    expect(workspaces).toEqual([])
    await Mutation.createWorkspace({}, {
      createWorkspaceInput: {
        name: 'Project Z', color: '#d5f4ef'
      }
    }, user)
    workspaces = await Query.workspaces({}, {}, user)
    expect(workspaces[0]).toMatchObject({
      "articles": [],
      "color": "#d5f4ef",
      "creator": new ObjectId("5a5b345f98f048281d88eac2"),
      "members": [new ObjectId("5a5b345f98f048281d88eac2")],
      "name": "Project Z",
    })
  })
})
