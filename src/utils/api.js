import Cookie from 'js-cookie'
const expressURL = import.meta.env.SNOWPACK_PUBLIC_EXPRESS_URL
const baseURL = `${expressURL}/api`

export const callAPI = async (route, method, body) => {
  // body should include filters
  const token = Cookie.get('x-access-token')
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': token
    },
    body: method !== 'GET'
      ? JSON.stringify(body)
      : null
  }

  const response = await fetch(`${baseURL}/${route}`, options)
  const data = response.json()

  return data
}
