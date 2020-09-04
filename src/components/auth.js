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

  const setFormValue = (event) => {
    const { name, value } = event.target
    const nextState = { ...formState }
    nextState[name] = value

    setFormState(nextState)
  }

  const submitForm = async () => {
    const body = {
      payload: { ...formState }
    }
    const { token } = await loginUser(body)
    setFormState(initialFormState)
    if (!token) return null
    const user = jwt_decode(token)
    setUser(user)
    history.push('/')
  }

  const formField = (field, label, options = []) => generateFormField(field, label, formState, setFormValue, options)

  return (
    <>
      {formField('username', 'Username')}
      {formField('password', 'Password')}
      <Button onClick={submitForm}>Login!</Button>
    </>
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

  return <Button onClick={handleLogout}>Logout</Button>
}
