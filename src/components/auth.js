import React, { useState, useContext } from 'react'
import { useHistory } from 'react-router-dom'
import { Button } from 'rbx'
import { jwt_decode } from 'jwt-decode-es'
import Cookie from 'js-cookie'
import { AuthContext } from '../contexts/auth'
import { generateFormField } from './scaffold/formField'
import { loginUser } from '../api/auth'

const initialFormState = {
  username: '',
  password: ''
}

export const LoginForm = () => {
  const [formState, setFormState] = useState(initialFormState)
  const { setUser } = useContext(AuthContext)
  const history = useHistory()

  const demoUsername = import.meta.env.SNOWPACK_PUBLIC_DEMO_PLAYER_USERNAME
  const demoPw = import.meta.env.SNOWPACK_PUBLIC_DEMO_PLAYER_PW

  const setFormValue = (event) => {
    const { name, value } = event.target
    const nextState = { ...formState }
    nextState[name] = value

    setFormState(nextState)
  }

  const submitForm = async (event) => {
    event.preventDefault()
    const body = {
      payload: { ...formState }
    }
    const { token } = await loginUser(body)
    setFormState(initialFormState)
    if (!token) return null
    const { _id: id, username, isAdmin } = jwt_decode(token)
    setUser({ id, username, isAdmin })
    history.push('/')
  }

  const formField = (field, label, options = []) => generateFormField(field, label, formState, setFormValue, options)
  const DemoCredentials = () => (
    <>
      <h1>Demo Account Credentials (case sensitive)</h1>
      <h1>Username: {demoUsername}</h1>
      <h1>Pw: {demoPw}</h1>
    </>
  )

  return (
    <form id='login' onSubmit={submitForm}>
      {formField('username', 'Username')}
      {formField('password', 'Password')}
      <Button type='submit'>Login!</Button>
      {demoUsername && demoPw && <DemoCredentials />}
    </form>
  )
}

export const LogoutButton = () => {
  const { clearUser } = useContext(AuthContext)
  const history = useHistory()

  const handleLogout = () => {
    clearUser()
    Cookie.remove('x-access-token')
    history.push('/')
  }

  return <a onClick={handleLogout}>Logout</a>
}
