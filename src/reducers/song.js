const SongReducer = (state, action) => {
  const { payload } = action
  let newEntries
  switch (action.type) {
    case 'SET_ENTRIES':
      return { ...state, entries: payload }

    case 'SET_PAGES':
      return { ...state, pageCount: payload }

    case 'SET_DETAIL':
      return { ...state, detail: payload }

    case 'ADD_ENTRY':
      newEntries = [...state.entries, payload]
      return { ...state, entries: newEntries }

    case 'UPDATE_ENTRY':
      console.log(payload)
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

    default:
      console.log('I don\'t recognize this action')
  }
}

export default SongReducer
