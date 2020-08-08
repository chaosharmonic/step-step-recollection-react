import { callAPI } from '../utils/api'

export const getAllReleases = async () => {
  const results = await callAPI('release/', 'GET', {})
  return results
}
export const getReleaseById = async (id) => {
  const results = await callAPI(`release/entry/${id}`, 'GET', {})
  return results
}
export const addRelease = async (body) => { // TODO: shape this arg
  const results = await callAPI('release/add', 'POST', body)
  return results
}
export const updateRelease = async (id, body) => {
  const results = await callAPI(`release/update/${id}/`, 'PUT', body)
  return results
}
export const deleteRelease = async (id) => {
  const results = await callAPI(`release/delete/${id}/`, 'DELETE', {})
  return results
}
