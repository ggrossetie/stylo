import { executeQuery } from './graphQL.js'

import { getFullUserProfile as getUserProfileQuery } from '../components/organisms/Credentials.graphql'

/**
 * @param sessionToken
 * @return {Promise<object>}
 */
export function getUserProfile({ sessionToken }) {
  return executeQuery({ sessionToken, query: getUserProfileQuery })
}
