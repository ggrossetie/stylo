import React from 'react'

import AuthProviders from '../organisms/credentials/AuthProviders.jsx'
import PasswordChange from '../organisms/credentials/PasswordChange.jsx'
import UserProfile from '../organisms/credentials/UserProfile.jsx'

export default function Credentials() {
  return (
    <>
      <UserProfile />
      <AuthProviders />
      <PasswordChange />
    </>
  )
}
