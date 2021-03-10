import { callAPI } from '../utils/api'

export const getAllAlbums = async () => {
  const results = await callAPI('album/', 'GET', {})
  return results
}
export const getAlbumById = async (id) => {
  const results = await callAPI(`album/entry/${id}`, 'GET', {})
  return results
}
export const addAlbum = async (body) => { // TODO: shape this arg
  const results = await callAPI('album/add', 'POST', body)
  return results
}
export const updateAlbum = async (id, body) => {
  const results = await callAPI(`album/update/${id}/`, 'PUT', body)
  return results
}
export const deleteAlbum = async (id) => {
  const results = await callAPI(`album/delete/${id}/`, 'DELETE', {})
  return results
}
