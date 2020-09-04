import { callAPI } from '../utils/api'
import Cookie from 'js-cookie'

const getExpireTime = (unit) => {
  if (unit === 'day') return 1
  if (unit === 'hour') return 24
  if (unit === 'minute') return 24 * 60
  if (unit === 'second') return 24 * 60 * 60
}

const expTime = import.meta.env.SNOWPACK_PUBLIC_COOKIE_EXP_TIME
const expUnit = import.meta.env.SNOWPACK_PUBLIC_COOKIE_EXP_UNIT

const expires = expTime/getExpireTime(expUnit)

export const loginUser = async (body) => {
  const result = await callAPI('auth/login', 'POST', body)
  if (result.token) Cookie.set('x-access-token', result.token, {expires})
  return result
}
