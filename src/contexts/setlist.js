import React, { createContext, useReducer } from 'react'
import SetlistReducer from '../reducers/setlist'

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
    songs: [],
    sessionDate: ''
  },
  queue: {
    songs: []
    // {
    //   id: '',
    //   title: '',
    //   album: '',
    //   numPads: 1,
    //   difficulty: '', // derive from settings
    //   record: {
    // }
  }
}

export const SetlistContext = createContext(initialState)

export const SetlistProvider = ({ children }) => {
  const [state, dispatch] = useReducer(SetlistReducer, initialState)

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

  const addToCurrentSetlist = (payload) => {
    const action = { type: 'ADD_TO_CURRENT_SESSION', payload }
    dispatch(action)
  }

  const updateCurrentSetlist = (payload) => {
    const action = { type: 'UPDATE_CURRENT_SESSION', payload }
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
      addToCurrentSetlist,
      updateCurrentSetlist
    }
  }

  return (
    <SetlistContext.Provider {...props}>
      {children}
    </SetlistContext.Provider>
  )
}
