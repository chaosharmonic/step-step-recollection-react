import { callAPI } from '../utils/api'

export const getAllSongs = async () => {
  const results = await callAPI('song/', 'GET', {})
  return results
}
export const getSongById = async (id) => {
  const results = await callAPI(`song/entry/${id}`, 'GET', {})
  return results
}
export const addSong = async (body) => {
  const results = await callAPI('song/add', 'POST', body)
  return results
}
export const updateSong = async (id, body) => {
  const results = await callAPI(`song/update/${id}/`, 'PUT', body)
  return results
}
export const deleteSong = async (id) => {
  const results = await callAPI(`song/delete/${id}/`, 'DELETE', {})
  return results
}
