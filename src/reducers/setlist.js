import { moveIndex } from '../utils/moveIndex'

const SetlistReducer = (state, action) => {
  const { payload } = action
  let newEntries, nextQueue
  switch (action.type) {
    case 'SET_ENTRIES':
      return { ...state, entries: payload }

    case 'SET_DETAIL':
      return { ...state, detail: payload }

    case 'ADD_ENTRY':
      newEntries = [...state.entries, payload]
      return { ...state, entries: newEntries, queue: { songs: [] } }

    case 'UPDATE_ENTRY':
      newEntries = [...state.entries]
        .map(e => e._id === payload._id
          ? payload
          : e
        )

      return { ...state, entries: newEntries }

    case 'DELETE_ENTRY':
      newEntries = [...state.entries]
        .filter(e => {
          return e._id !== payload._id
        })

      return { ...state, entries: newEntries }

    case 'ADD_TO_CURRENT_SESSION':
      nextQueue = state.queue.songs
        ? { songs: [...state.queue.songs, payload] }
        : { songs: [payload] }
      return { ...state, queue: nextQueue }

    case 'UPDATE_CURRENT_SESSION':
      nextQueue = { ...state.queue }
      nextQueue.songs = payload
      return { ...state, queue: nextQueue }

    default:
      console.log('I don\'t recognize this action')
  }
}

export default SetlistReducer
