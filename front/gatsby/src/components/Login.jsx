import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'

import styles from './login.module.scss'

const mapStateToProps = ({ activeUser, applicationConfig }) => {
  return { activeUser, applicationConfig }
}

const mapDispatchToProps = (dispatch) => {
  return {
    login: (data) => dispatch({ type: 'LOGIN', login: data }),
    logout: () => dispatch({ type: 'LOGOUT' }),
  }
}

const Login = ({ login, applicationConfig }) => {
  const usernameInput = useRef(null)
  const passwordInput = useRef(null)

  const handleSubmit = (event, applicationConfig) => {
    event.preventDefault()
    const username = usernameInput.current.value
    const password = passwordInput.current.value

    fetch(applicationConfig.backendEndpoint + '/login', {
      method: 'POST',
      // this parameter enables the cookie directive (set-cookie)
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => {
        return response.ok
          ? response.json()
          : Promise.reject(new Error('Email or password is incorrect'))
      })
      .then(login)
      .catch((error) => {
        console.error(error)
        alert(error)
      })
  }

  return (
    <>
      <section className={styles.disclaimer}>
        <p>
          Looking for technical and editing support?
          <br />
          Join the{' '}
          <a
            href="https://ecrituresnumeriques.ca/en/2019/10/25/Stylo-technical-and-editing-support"
            target="_blank"
          >
            weekly session
          </a>{' '}
          for Stylo users.
        </p>
      </section>

      {applicationConfig && (
        <section className={styles.box}>
          <h1 className={styles.loginTitle}>Login</h1>
          <form onSubmit={(event) => handleSubmit(event, applicationConfig)}>
            <fieldset>
              <legend>
                Connect via Huma-Num <small>(recommended)</small>
              </legend>
              <p>
                <a
                  className={styles.humaNumConnectBtn}
                  href={applicationConfig.backendEndpoint + '/login/openid'}
                >
                  Connect with Huma-Num
                </a>
                <a
                  className={styles.humaNumCreateAccountBtn}
                  href={applicationConfig.humanIdRegisterEndpoint}
                >
                  Create a Huma-Num account
                </a>
              </p>
              <p className={styles.note}>
                If you use the same email address for your{' '}
                <strong>existing</strong> Stylo account and for your Huma-Num
                account, the two accounts will be automatically merged.
              </p>
            </fieldset>
            <hr />
            <fieldset>
              <legend>Connect with an existing Stylo account</legend>
              <div className={styles.fieldHorizontal}>
                <label className="label">Username</label>
                <input
                  type="string"
                  name="username"
                  required={true}
                  ref={usernameInput}
                />
              </div>
              <div className={styles.fieldHorizontal}>
                <label className="label">Password</label>
                <input
                  type="password"
                  name="password"
                  required={true}
                  autoComplete="current-password"
                  ref={passwordInput}
                />
              </div>
              <div className={styles.fieldHorizontal}>
                <label />
                <button type="submit">Login</button>
              </div>
              <p className="note">
                or <Link to="/register">create an account</Link>
              </p>
            </fieldset>
          </form>
        </section>
      )}
    </>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(Login)