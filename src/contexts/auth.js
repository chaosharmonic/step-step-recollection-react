import React, { createContext, useReducer } from 'react'
import AuthReducer from '../reducers/auth'

const id = import.meta.env.ADMIN_PLAYER || null
const username = import.meta.env.ADMIN_USERNAME || null

const initialState = {
  user: {
    id,
    username,
    isAdmin: Boolean(id) // TODO: permissions
  }
}

export const AuthContext = createContext(initialState)

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, initialState)

  const login = (payload) => {
    const action = { type: 'USER_LOGIN', payload }
    dispatch(action)
  }

  const logout = (payload) => {
    const action = { type: 'USER_LOGOUT', payload }
    dispatch(action)
  }

  const props = {
    value: {
      ...state,
      login,
      logout
    }
  }

  return (
    <AuthContext.Provider {...props}>
      {children}
    </AuthContext.Provider>
  )
}
