const mongoose = require('mongoose')
const Schema = mongoose.Schema

const workspaceSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  color: {
    type: String
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  articles: [{
    type: Schema.Types.ObjectId,
    ref: 'Article'
  }],
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
}, { timestamps: true })

module.exports = mongoose.model('Workspace', workspaceSchema)
module.exports.schema = workspaceSchema
