const AuthReducer = (state, action) => {
  const { payload } = action
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: payload }

    case 'CLEAR_USER':
      return { ...state, user: payload }
    default:
      console.log('I don\'t recognize this action')
  }
}

export default AuthReducer
