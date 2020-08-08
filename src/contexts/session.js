import React, { createContext, useReducer } from 'react'
import SessionReducer from '../reducers/session'

const initialState = {
  // menu: {
  //   sortOrder: {},
  //   pagination: {},
  //   filters: {}
  // },
  entries: [],
  detail: {
    player: {
      id: '',
      username: ''
    },
    songs: []
  },
  queue: {
    songs: []
    // {
    //   id: '',
    //   title: '',
    //   release: '',
    //   numPads: 1,
    //   difficulty: '', // derive from settings
    //   record: {
    // }
  }
}

export const SessionContext = createContext(initialState)

export const SessionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(SessionReducer, initialState)

  const setEntries = (payload) => {
    const action = { type: 'SET_ENTRIES', payload }
    dispatch(action)
  }

  const setDetail = (payload) => {
    const action = { type: 'SET_DETAIL', payload }
    dispatch(action)
  }

  const addEntry = (payload) => {
    const action = { type: 'ADD_ENTRY', payload }
    dispatch(action)
  }

  const updateEntry = (payload) => {
    const action = { type: 'UPDATE_ENTRY', payload }
    dispatch(action)
  }

  const deleteEntry = (payload) => {
    const action = { type: 'DELETE_ENTRY', payload }
    dispatch(action)
  }

  const addToCurrentSession = (payload) => {
    const action = { type: 'ADD_TO_CURRENT_SESSION', payload }
    dispatch(action)
  }

  const removeFromCurrentSession = (payload) => {
    const action = { type: 'REMOVE_FROM_CURRENT_SESSION', payload }
    dispatch(action)
  }

  const moveInSession = (payload) => {
    const action = { type: 'MOVE_IN_SESSION', payload }
    dispatch(action)
  }

  const props = {
    value: {
      ...state,
      setEntries,
      setDetail,
      addEntry,
      updateEntry,
      deleteEntry,
      addToCurrentSession,
      removeFromCurrentSession,
      moveInSession
    }
  }

  return (
    <SessionContext.Provider {...props}>
      {children}
    </SessionContext.Provider>
  )
}
