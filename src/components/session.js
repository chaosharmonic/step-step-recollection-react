import React, { useContext, useEffect, useState } from 'react'
import { Link, useLocation, useHistory } from 'react-router-dom'
import { Button, Title, Table } from 'rbx'
import { parse, format, isValid } from 'date-fns'
import { addSession, getAllSessions, getSessionById, updateSession, deleteSession } from '../api/session'
import { SessionContext } from '../contexts/session'
import { AuthContext } from '../contexts/auth'
import { moveIndex } from '../utils/moveIndex'
import { generateFormField } from './scaffold/formField'

const context = SessionContext
const [
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord
] = [
  addSession,
  getAllSessions,
  getSessionById,
  updateSession,
  deleteSession
]
const initialTargetId = ''
const path = 'session'

export const SessionQueue = ({ targetId, updateOuterState }) => {
  const { detail, queue, setDetail, updateCurrentSession, addEntry, updateEntry } = useContext(context)
  const { user: { id } } = useContext(AuthContext)
  const { songs, sessionDate = new Date() } = targetId
    ? detail
    : queue

  const [editTarget, setEditTarget] = useState(null)
  const clearEditTarget = () => setEditTarget(null)

  const date = format(new Date(sessionDate), 'MM/dd/yyyy')
  const [formState, setFormState] = useState({ sessionDate: date })

  const [entries, setEntries] = useState(songs)
  useEffect(() => setEntries(songs), [songs])

  const handleCreateRecord = async () => {
    const body = {
      payload: { player: id, songs: [...entries], sessionDate }
    }
    const response = await createRecord(body)
    response._id
      ? addEntry(response)
      : console.log(response)
  }

  const handleUpdateRecord = async (id) => {
    const date = parse(formState.sessionDate, 'MM/dd/yyyy', new Date())

    if (!isValid(date)) {
      console.log('Invalid date!')
      return null
    }

    const body = {
      payload: { songs: [...entries], sessionDate: date }
    }
    const response = await updateRecord(id, body)
    if (response._id) {
      updateEntry(response)
      setDetail(response)
      updateOuterState()
    } else {
      console.log(response)
    }
  }

  const handleUpdateQueue = (arr) => targetId
    ? setEntries(arr)
    : updateCurrentSession(arr)

  const move = (target, destination) => {
    const next = moveIndex(entries, target, destination)
    handleUpdateQueue(next)
  }

  const remove = (target) => {
    const next = entries.filter((e, i) => target !== i)
    handleUpdateQueue(next)
  }

  const edit = (target, payload) => {
    const next = entries.map((e, i) => i === target
      ? payload
      : e)
    handleUpdateQueue(next)
  }

  const handleSubmitSession = () => targetId
    ? handleUpdateRecord(targetId)
    : handleCreateRecord()

  const setFormValue = (event) => {
    const { name, value } = event.target
    const nextState = { ...formState }
    nextState[name] = value

    setFormState(nextState)
  }

  const formField = (field, label, options = []) => generateFormField(field, label, formState, setFormValue, options)

  const entriesList = entries
    .map((song, i) => {
      const { id, title, difficulty } = song
      const handleRemoveFromSession = () => remove(i)
      const isBeginning = i === 0
      const isEnd = i === songs.length - 1

      const handleMoveUp = () => move(i, i - 1)
      const handleMoveDown = () => move(i, i + 1)

      const handleSelectEdit = () => setEditTarget(i)
      const handleEdit = (state) => edit(i, state)

      return (
        <Table.Row key={id}>
          <Table.Cell>
            {title}
          </Table.Cell>
          {editTarget !== i
            ? (
              <>
                <Table.Cell>
                  {difficulty}
                </Table.Cell>
                <Table.Cell>
                  <Button onClick={handleRemoveFromSession}>Remove from session</Button>
                </Table.Cell>
                <Table.Cell>
                  <Button onClick={handleSelectEdit}>Edit Chart</Button>
                </Table.Cell>
                <Table.Cell>
                  {!isBeginning && <Button onClick={handleMoveUp}>Up</Button>}
                  {!isEnd && <Button onClick={handleMoveDown}>Down</Button>}
                </Table.Cell>
              </>
            )
            : <SessionQueueForm
              song={song}
              setOuterTarget={clearEditTarget}
              handleSubmit={handleEdit}
              />}

        </Table.Row>
      )
    })
  return (
    <>
      <Table>
        {entriesList}
      </Table>
      {formField('sessionDate', 'Session Date')}
      <Button onClick={handleSubmitSession}>Save session!</Button>
    </>
  )
}

export const SessionQueueForm = ({ song, setOuterTarget, handleSubmit }) => {
  const { title, charts, difficulty = 'expert' } = song
  const cancelSubmit = () => setOuterTarget(initialTargetId)

  const id = song.song || song._id
  const sessionQueueFormState = {
    song: id,
    title,
    record: {
      passed: true
    },
    numPads: 1,
    difficulty
  }
  const [formState, setFormState] = useState(sessionQueueFormState)

  const handleSelectSubmit = () => {
    handleSubmit({ ...formState, song: id, charts })
    setOuterTarget(initialTargetId)
  }

  const availableCharts = charts.filter(chart => chart.level)

  const availablePads = [...new Set(charts
    .map(chart => chart.numPads)
  )]

  const availableDifficulties = availableCharts
    .filter(chart => Number(chart.numPads) === Number(formState.numPads))
    .sort((a, b) => a.level - b.level)
    .map(({ difficulty, level }) => ({ key: difficulty, text: `${difficulty} - ${level}` }))

  const setFormValue = (event) => {
    const { name, value } = event.target
    const nextState = { ...formState }
    nextState[name] = value

    setFormState(nextState)
  }

  const formField = (field, label, options = []) => generateFormField(field, label, formState, setFormValue, options)
  const boolPair = [true, false]
    .map(e => ({
      key: e,
      text: e ? 'Yes' : 'No'
    }))

  const submitText = 'Save chart'

  return (
    <>
      {formField('numPads', 'Style', availablePads)}
      {formField('difficulty', 'Difficulty', availableDifficulties)}
      {formField('record.passed', 'Passed?', boolPair)}
      <Button size='small' onClick={cancelSubmit}>Cancel</Button>
      <Button size='small' onClick={handleSelectSubmit}>{submitText}</Button>
    </>
  )
}

export const Session = () => {
  const { entries, queue, setEntries, deleteEntry } = useContext(context)
  const { user: { id: playerId, isAdmin } } = useContext(AuthContext)

  const { songs = [] } = queue

  const [deleteTarget, setDeleteTarget] = useState(initialTargetId)

  useEffect(() => {
    async function getRecords () {
      const sessions = await getAllRecords()
      setEntries(sessions)
    }
    getRecords()
  }, [])

  const handleDeleteRecord = async (id) => {
    const response = await deleteRecord(id)
    response._id
      ? deleteEntry(response)
      : console.log(response)
  }

  const entriesList = entries && entries.map(entry => {
    const { sessionDate, _id: id, player } = entry
    const { username } = player
    const submitDelete = () => handleDeleteRecord(id)
    const setDeleteConfirmation = () => setDeleteTarget(id)
    const cancelDelete = () => setDeleteTarget(initialTargetId)

    const DeleteConfirmation = () => (
      <>
        <Button onClick={cancelDelete}>Cancel Delete</Button>
        <Button onClick={submitDelete}>Confirm Delete</Button>
      </>
    )

    const date = format(new Date(sessionDate), 'MM/dd/yyyy')

    const canDelete = playerId === player.id || isAdmin

    return (
      <Table.Row key={id}>
        <Table.Cell>
          <Link to={`/session/${id}`}>{date}</Link>
        </Table.Cell>
        <Table.Cell>
          {username}
        </Table.Cell>
        <Table.Cell>
          {canDelete &&
            (deleteTarget === id
              ? <DeleteConfirmation />
              : <Button onClick={setDeleteConfirmation}>Delete</Button>)}
        </Table.Cell>
      </Table.Row>
    )
  })

  return (
    <>
      <Title>{path} route!</Title>
      <h1>Current session:</h1>
      {songs.length
        ? <SessionQueue songs={songs} />
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
  const { songs, player: { username }, sessionDate } = detail
  const history = useHistory()
  const [updating, setUpdating] = useState(false)

  const handleToggleEdit = () => setUpdating(!updating)

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

  const entriesList = songs.map(({ id, title, difficulty, record: { passed } }) => {
    return (
      <Table.Row key={id}>
        <Table.Cell>
          {title}
        </Table.Cell>
        <Table.Cell>
          {difficulty}
        </Table.Cell>
        <Table.Cell>
          {passed ? 'Pass' : 'Fail'}
        </Table.Cell>
      </Table.Row>
    )
  })

  const passed = songs.filter(song => song.record.passed)
  const date = sessionDate && format(new Date(sessionDate), 'MM/dd/yyyy')

  const content = (
    <>
      <h1>Player: {username}</h1>
      <h1>Date: {date}</h1>
      <h1>Total songs: {songs.length} </h1>
      <h1>Total passed: {passed.length} </h1>
      <Table>
        {entriesList}
      </Table>
    </>
  )

  const editText = updating ? 'Cancel Edit' : 'Edit'

  const handleBack = () => history.goBack()

  return (
    <>
      <h1>{path} detail!</h1>
      {updating
        ? <SessionQueue targetId={id} updateOuterState={handleToggleEdit} />
        : content}
      <Button onClick={handleToggleEdit}>{editText}</Button>
      <Button onClick={handleBack}>Go back!!</Button>
    </>
  )
}
