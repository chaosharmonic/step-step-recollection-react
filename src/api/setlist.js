import { callAPI } from '../utils/api'

export const getAllSessions = async () => {
  const results = await callAPI('session/', 'GET', {})
  return results
}
export const getSessionById = async (id) => {
  const results = await callAPI(`session/entry/${id}`, 'GET', {})
  return results
}
export const getSessionsByPlayerId = async (id) => {
  const results = await callAPI(`session/player/${id}`, 'GET', {})
  return results
}
export const addSession = async (body) => {
  const results = await callAPI('session/add', 'POST', body)
  return results
}
export const updateSession = async (id, body) => {
  const results = await callAPI(`session/update/${id}/`, 'PUT', body)
  return results
}
export const deleteSession = async (id) => {
  const results = await callAPI(`session/delete/${id}/`, 'DELETE', {})
  return results
}
