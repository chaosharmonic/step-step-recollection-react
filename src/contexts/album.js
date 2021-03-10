import React, { createContext, useReducer } from 'react'
import AlbumReducer from '../reducers/album'

const initialState = {
  // options: {
  //   sort: { // inherit from player defaults
  //     field: null,
  //     order: null
  //   },
  //   // page: 1,
  //   // display: {}, // inherit from player defaults
  //   filters: {} // inherit from player defaults
  // },
  entries: [], // get from API on opening route
  detail: {
    album: {},
    songs: []
    // ,courses: []
  }
}

export const AlbumContext = createContext(initialState)

export const AlbumProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AlbumReducer, initialState)

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

  const props = {
    value: {
      ...state,
      setEntries,
      setDetail,
      addEntry,
      updateEntry,
      deleteEntry
    }
  }

  return (
    <AlbumContext.Provider {...props}>
      {children}
    </AlbumContext.Provider>
  )
}
