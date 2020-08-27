const AuthReducer = (state, action) => {
  const { payload } = action
  switch (action.type) {
    case 'USER_LOGIN':
      return { ...state, user: payload }

    case 'USER_LOGOUT':
      return { ...state, pageCount: payload }
    default:
      console.log('I don\'t recognize this action')
  }
}

export default AuthReducer
