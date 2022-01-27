import React, { useState, useEffect } from 'react'
import { useSelector, shallowEqual } from 'react-redux'

import styles from './credentials.module.scss'
import acquintancesStyles from './acquintances.module.scss'
import Button from "./Button";

import AcquintanceService from '../services/AcquintanceService'
import { UserMinus, UserPlus } from 'react-feather';
import { useCallback } from 'react';

export default function CredentialsAccountSharing () {
  const [loading, setLoading] = useState(true)
  const [permissions, setPermissions] = useState([])
  const [acquintances, setAcquintances] = useState([])
  const activeUser = useSelector(state => state.activeUser, shallowEqual)
  const applicationConfig = useSelector(state => state.applicationConfig, shallowEqual)
  const acquintanceService = new AcquintanceService(activeUser._id, applicationConfig)

  const userPermissionsIds = permissions.filter(p => p.scope === 'user').map(({ user }) => user._id)

  useEffect(() => {
    if (loading) {
      acquintanceService.getAcquintancesAndPermissions().then(data => {
        setLoading(false)
        setPermissions(data.user.permissions)
        setAcquintances(data.user.acquintances)
      })
    }
  }, [loading])

  const giveAccountAccess = useCallback(async ({ from, to }) => {
    const data = await acquintanceService.grantAccountAccessTo({ from, to })
    setPermissions(data.grantAccountAccess.permissions)
    setAcquintances(data.grantAccountAccess.acquintances)
  }, [])

  const revokeAccountAccess = useCallback(async ({ from, to }) => {
    const data = await acquintanceService.revokeAccountAccessTo({ from, to })
    setPermissions(data.revokeAccountAccess.permissions)
    setAcquintances(data.revokeAccountAccess.acquintances)
  }, [])

  return <section className={styles.section}>
    <h2>Grant Access</h2>

    <p>
      <strong>Share your <em>articles</em> with Stylo contacts you trust</strong>.
      They will <strong>see all</strong> your articles, granting them the ability to <strong>modify</strong> them.
      It applies to all future articles you will create as well.
    </p>

    <ul>
      {acquintances.map(acquintance => <li key={acquintance._id} className={acquintancesStyles.acquintance}>
        <div>
          <span>{acquintance.displayName}</span>
          <a href={"mailto:" + acquintance.email} className={acquintancesStyles.acquintanceEmail}>
            {acquintance.email}
          </a>
        </div>

        {!userPermissionsIds.includes(acquintance._id) && <div className={acquintancesStyles.acquintanceActions}>
          <Button onClick={() => giveAccountAccess({ from: activeUser._id, to: acquintance._id })}>
            <UserPlus /> Give full access
          </Button>
        </div>}

        {userPermissionsIds.includes(acquintance._id) && <div className={acquintancesStyles.acquintanceActions}>
          <Button onClick={() => revokeAccountAccess({ from: activeUser._id, to: acquintance._id })}>
            <UserMinus /> Revoke access
          </Button>
        </div>}
      </li>)}
    </ul>
  </section>
}
