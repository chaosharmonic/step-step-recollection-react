import { callAPI } from '../utils/api'

export const getAllSetlists = async () => {
  const results = await callAPI('setlist/', 'GET', {})
  return results
}
export const getSetlistById = async (id) => {
  const results = await callAPI(`setlist/entry/${id}`, 'GET', {})
  return results
}
export const getSetlistsByPlayerId = async (id) => {
  const results = await callAPI(`setlist/player/${id}`, 'GET', {})
  return results
}
export const addSetlist = async (body) => {
  const results = await callAPI('setlist/add', 'POST', body)
  return results
}
export const updateSetlist = async (id, body) => {
  const results = await callAPI(`setlist/update/${id}/`, 'PUT', body)
  return results
}
export const deleteSetlist = async (id) => {
  const results = await callAPI(`setlist/delete/${id}/`, 'DELETE', {})
  return results
}
