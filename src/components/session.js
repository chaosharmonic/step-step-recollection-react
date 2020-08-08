import React, { useContext, useEffect, useState } from 'react'
import { Link, useLocation, useHistory } from 'react-router-dom'
import { Button, Field, Control, Label, Input, Select, Title, Table } from 'rbx'
import { format } from 'date-fns'
import { addSession, getAllSessions, getSessionById, deleteSession } from '../api/session'
import { SessionContext } from '../contexts/session'

const context = SessionContext
const [
  createRecord,
  getAllRecords,
  getRecordById,
  // updateRecord
  deleteRecord
] = [
  addSession,
  getAllSessions,
  getSessionById,
  // updateSession
  deleteSession
]
const initialTargetId = ''
const path = 'session'

export const Session = () => {
  const { entries, queue, setEntries, addEntry, deleteEntry, removeFromCurrentSession, moveInSession } = useContext(context)

  const { songs = [] } = queue

  const [deleteTarget, setDeleteTarget] = useState(initialTargetId)

  useEffect(() => {
    async function getRecords () {
      const sessions = await getAllRecords()
      setEntries(sessions)
    }
    getRecords()
  }, [])

  const handleCreateRecord = async () => {
    const sessionDate = new Date()
    const body = {
      payload: { ...queue, sessionDate }
    }
    const response = await createRecord(body)
    response._id
      ? addEntry(response)
      : console.log(response)
  }

  const handleDeleteRecord = async (id) => {
    const response = await deleteRecord(id)
    response._id
      ? deleteEntry(response)
      : console.log(response)
  }

  const CurrentSessionDetails = () => songs
    .map(({ id, title, difficulty }, i) => {
      const handleRemoveFromSession = () => removeFromCurrentSession(i)
      const isBeginning = i === 0
      const isEnd = i === songs.length - 1

      const move = (target, destination) => moveInSession({ target, destination })

      const handleMoveUp = () => move(i, i - 1)
      const handleMoveDown = () => move(i, i + 1)

      return (
        <li key={id}>
          {title} - {difficulty}
          {!isBeginning && <Button onClick={handleMoveUp}>Up</Button>}
          {!isEnd && <Button onClick={handleMoveDown}>Down</Button>}
          <Button onClick={handleRemoveFromSession}>Remove from session</Button>
        </li>
      )
    })

  const entriesList = entries && entries.map(entry => {
    const { sessionDate, _id } = entry
    const id = _id
    const submitDelete = () => handleDeleteRecord(id)
    const setDeleteConfirmation = () => setDeleteTarget(id)
    const cancelDelete = () => setDeleteTarget(initialTargetId)

    const DeleteConfirmation = () => (
      <>
        <Button onClick={cancelDelete}>Cancel Delete</Button>
        <Button onClick={submitDelete}>Confirm Delete</Button>
      </>
    )

    return (
      <Table.Row key={id}>
        <Table.Cell>
          <Link to={`/session/${id}`}>{format(new Date(sessionDate), 'MM/dd/yyyy')}</Link>
        </Table.Cell>
        <Table.Cell>
          {
            deleteTarget === id
              ? <DeleteConfirmation />
              : <Button onClick={setDeleteConfirmation}>Delete</Button>
          }
        </Table.Cell>
      </Table.Row>
    )
  })

  return (
    <>
      <Title>{path} route!</Title>
      <h1>Current session:</h1>
      {songs.length
        ? (
          <>
            <CurrentSessionDetails />
            <Button onClick={handleCreateRecord}>Add new session!</Button>
          </>
        )
        : <p>Session is empty!</p>}
      <Table>
        <Table.Body>
          {entriesList}
        </Table.Body>
      </Table>
    </>
  )
}

export const SessionDetail = () => {
  const { detail, setDetail, updateEntry } = useContext(context)
  const { songs, player, sessionDate } = detail
  const history = useHistory()
  const [updating, setUpdating] = useState(false)

  const handleSelectEdit = () => setUpdating(true)

  const location = useLocation()
  const id = location.pathname.replace(`/${path}/`, '')

  const handleGetRecord = async (id) => {
    const response = await getRecordById(id)
    setDetail(response)
  }

  useEffect(() => {
    async function getDetail () {
      handleGetRecord(id)
    }
    getDetail()
  }, [id])

  const entriesList = songs.map(({ id, title, difficulty }) => {
    return (
      <li key={id}>{title} - {difficulty}</li>
    )
  })

  const username = player
    ? player.username
    : 'Casval'

  const content = (
    <>
      <h1>Player: {username}</h1>
      <h1>Total songs: {songs.length} </h1>
    </>
  )

  const handleBack = () => history.goBack()

  return (
    <>
      <h1>{path} detail!</h1>
      {!updating &&
        // ? <SessionForm
        //   targetId={id}
        //   setSubmitting={setUpdating}
        // />
        content}
      {entriesList}
      {/* <Button onClick={handleSelectEdit}>Edit</Button> */}
      <Button onClick={handleBack}>Go back!!</Button>
    </>
  )
}
