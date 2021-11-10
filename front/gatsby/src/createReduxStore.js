import { applyMiddleware, createStore } from 'redux'
import { toEntries } from './helpers/bibtex'
import VersionService from "./services/VersionService";

function createReducer (initialState, handlers) {
  return function reducer (state = initialState, action) {
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action)
    } else {
      return state
    }
  }
}

// Définition du store Redux et de l'ensemble des actions
const initialState = {
  logedIn: false,
  users: [],
  password: undefined,
  sessionToken: undefined,
  article: {},
  articleStructure: [],
  articleVersions: [],
  articleStats: {
    wordCount: 0,
    charCountNoSpace: 0,
    charCountPlusSpace: 0,
    citationNb: 0,
  },
}

const reducer = createReducer(initialState, {
  APPLICATION_CONFIG: setApplicationConfig,
  PROFILE: setProfile,
  CLEAR_ZOTERO_TOKEN: clearZoteroToken,
  LOGIN: loginUser,
  UPDATE_ACTIVE_USER: updateActiveUser,
  RELOAD_USERS: reloadUsers,
  SWITCH: switchUser,
  LOGOUT: logoutUser,
  REMOVE_MYSELF_ALLOWED_LOGIN: removeMyselfAllowedLogin,

  // article reducers
  UPDATE_ARTICLE_STATS: updateArticleStats,
  UPDATE_ARTICLE_STRUCTURE: updateArticleStructure,
  UPDATE_ARTICLE_BIB: updateArticleBib,

  UPDATE_CURRENT_ARTICLE: setCurrentArticle,
  SET_CURRENT_ARTICLE_TEXT: setCurrentArticleText,
  SET_CURRENT_ARTICLE_METADATA: setCurrentArticleMetadata,

  SET_ARTICLE_VERSIONS: setArticleVersions
})

const updateCurrentVersion = async function(versionService, md, bib, yaml, articleVersions, store) {
  console.log('versionService.updateCurrentVersion')
  const response = await versionService.updateCurrentVersion(md, bib, yaml)
  // Last version had same _id, we gucchi to update!
  //const immutableVersions = [...articleVersions]
  // shift the first item of the array
  //const [_, ...rest] = immutableVersions
  // REMIND: we could dispatch a `SET_CURRENT_ARTICLE_VERSION` instead
  console.log('SET_ARTICLE_VERSIONS')
  store.dispatch({ type: 'SET_ARTICLE_VERSIONS', versions: [response.saveVersion, ...articleVersions] })
}

const updateCurrentArticleVersion = store => {
  return next => {
    return async (action) => {
      // QUESTION: should use the verb "save" or "persist" (i.e., save changes into the database)
      if (action.type === 'UPDATE_CURRENT_ARTICLE_TEXT') {
        const { articleVersions, activeUser, article, applicationConfig } = store.getState()
        console.log({state: store.getState()})
        const userId = activeUser._id
        const articleId = article._id
        const md = action.text
        const { yaml, bib } = article
        const versionService = new VersionService(userId, articleId, applicationConfig)
        await updateCurrentVersion(versionService, md, bib, yaml, articleVersions, store)
        return next(action)
      } else  if (action.type === 'UPDATE_CURRENT_ARTICLE_METADATA') {
        const { articleVersions, activeUser, article, applicationConfig } = store.getState()
        const userId = activeUser._id
        const articleId = article._id
        const yaml = action.metadata
        const { md, bib }  = article
        const versionService = new VersionService(userId, articleId, applicationConfig)
        await updateCurrentVersion(versionService, md, bib, yaml, articleVersions, store)
        return next(action)
      } else if (action.type === 'SAVE_NEW_VERSION') {
        const { articleVersions, article, activeUser, applicationConfig } = store.getState()
        console.log({state: store.getState()})
        const userId = activeUser._id
        const articleId = article._id
        const { message, major } = action
        const versionService = new VersionService(userId, articleId, applicationConfig)
        const response = await versionService.saveNewVersion(article.md, article.bib, article.yaml, major, message)
        // REMIND: we could dispatch a `SET_CURRENT_ARTICLE_VERSION` instead
        store.dispatch({ type: 'SET_ARTICLE_VERSIONS', versions: [response.saveVersion, ...articleVersions] })
        return next(action)
      } else {
        return next(action)
      }
    }
  }
}

function setApplicationConfig (state, action) {
  const applicationConfig = {
    ...action.applicationConfig
  }

  return { ...state, applicationConfig }
}

function setProfile (state, action) {
  if (!action.user) {
    return { ...state, hasBooted: true }
  }

  const { user: activeUser } = action

  return Object.assign({}, state, {
    hasBooted: true,
    activeUser,
    logedIn: true,
    // it will allow password modification if logged with password,
    // otherwise it means we use an external auth service
    password:
      activeUser.passwords.find((p) => p.email === activeUser.email) || {},
    users: [activeUser._id],
  })
}

function clearZoteroToken (state) {      if (versions[0]._id !== response.saveVersion._id) {
        setVersions([response.saveVersion, ...versions])
      } else {
        //Last version had same _id, we gucchi to update!
        const immutableV = [...versions]
        //shift the first item of the array
        const [_, ...rest] = immutableV
        setVersions([response.saveVersion, ...rest])
      }
  state.activeUser.zoteroToken = null

  return state
}

function loginUser (state, { login }) {
  if (login.password && login.users && login.token) {
    return {
      ...state,
      logedIn: true,
      users: login.users,
      activeUser: login.users[0],
      password: login.password,
      sessionToken: login.token,
    }
  }

  return state
}

function updateActiveUser (state, action) {
  return {
    ...state,
    activeUser: { ...state.activeUser, displayName: action.payload },
    users: [...state.users].map((u) => {
      if (state.activeUser._id === u._id) {
        u.displayName = action.payload
      }
      return u
    })

  }
}

function reloadUsers (state, { payload: users }) {
  return { ...state, users }
}

function switchUser (state, { payload: activeUser }) {
  if (state.users.map((u) => u._id).includes(activeUser._id)) {
    return { ...state, activeUser }
  }

  return state
}

function logoutUser (state) {
  return { ...state, ...initialState }
}

function removeMyselfAllowedLogin (state, { payload: userId }) {
  const remainingUsers = state.users.filter((u) => u._id !== userId)

  return {
    ...state,
    users: remainingUsers,
    activeUser: remainingUsers[0],
  }
}

const SPACE_RE = /\s+/gi
const CITATION_RE = /(\[@[\w-]+)/gi
const REMOVE_MARKDOWN_RE = /[#_*]+\s?/gi

function updateArticleStats (state, { md }) {
  const text = (md || '').trim()

  const textWithoutMarkdown = text.replace(REMOVE_MARKDOWN_RE, '')
  const wordCount = textWithoutMarkdown
    .replace(SPACE_RE, ' ')
    .split(' ').length

  const charCountNoSpace = textWithoutMarkdown.replace(SPACE_RE, '').length
  const charCountPlusSpace = textWithoutMarkdown.length
  const citationNb = text.match(CITATION_RE)?.length || 0

  return {
    ...state, articleStats: {
      wordCount,
      charCountNoSpace,
      charCountPlusSpace,
      citationNb
    }
  }
}

function updateArticleStructure (state, { md }) {
  const text = (md || '').trim()
  const articleStructure = text
    .split('\n')
    .map((line, index) => ({ line, index }))
    .filter((lineWithIndex) => lineWithIndex.line.match(/^##+\ /))
    .map((lineWithIndex) => {
      const title = lineWithIndex.line
        .replace(/##/, '')
        //arrow backspace (\u21B3)
        .replace(/#\s/g, '\u21B3')
        // middle dot (\u00B7) + non-breaking space (\xa0)
        .replace(/#/g, '\u00B7\xa0')
      return { ...lineWithIndex, title }
    })

  return { ...state, articleStructure }
}

function updateArticleBib(state, { bib }) {
  const articleBibTeXEntries = toEntries(bib)
  return { ...state, articleBib: bib, articleBibTeXEntries }
}

function setArticleVersions(state, { versions }) {
  console.log('setArticleVersions')
  return { ...state, articleVersions: versions }
}

function setCurrentArticleText(state, { text }) {
  return {
    ...state,
    article: { ...state.article, md: text }
  }
}

function setCurrentArticleMetadata(state, { metadata }) {
  return {
    ...state,
    article: { ...state.article, yaml: metadata }
  }
}

function setCurrentArticle(state, { article }) {
  return {
    ...state,
    article
  }
}

export default () => createStore(
  reducer,
  applyMiddleware(updateCurrentArticleVersion),
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())
