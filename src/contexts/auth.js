import React, { createContext, useReducer } from 'react'
import Cookie from 'js-cookie'
import { jwt_decode } from 'jwt-decode-es'
import AuthReducer from '../reducers/auth'

const isDevelop = null //import.meta.env.SNOWPACK_PUBLIC_ENVIRONMENT === 'development'

const adminUser = isDevelop
  ? import.meta.env.SNOWPACK_PUBLIC_ADMIN_PLAYER_USERNAME
  : null
const adminId = isDevelop
  ? import.meta.env.SNOWPACK_PUBLIC_ADMIN_PLAYER_ID 
  : null

const token = Cookie.get('x-access-token')
const { 
  _id: id = adminId,
  username = adminUser,
  isAdmin = Boolean(adminId)
} = token ? jwt_decode(token) : {}

const initialState = {
  user: {
    id,
    username,
    isAdmin
  }
}

export const AuthContext = createContext(initialState)

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, initialState)

  const setUser = (payload) => {
    const action = { type: 'SET_USER', payload }
    dispatch(action)
  }

  const clearUser = () => {
    const action = { type: 'CLEAR_USER', initialState }
    dispatch(action)
  }

  const props = {
    value: {
      ...state,
      setUser,
      clearUser
    }
  }

  return (
    <AuthContext.Provider {...props}>
      {children}
    </AuthContext.Provider>
  )
}
