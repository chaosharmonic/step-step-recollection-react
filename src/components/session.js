import React, { useContext, useEffect, useState } from 'react'
import { Link, useLocation, useHistory } from 'react-router-dom'
import { Column, Container, Content, Title, Button } from 'rbx'
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io'
import { parse, format, isValid } from 'date-fns'
import { addSession, getAllSessions, getSessionById, updateSession, deleteSession } from '../api/session'
import { SessionContext } from '../contexts/session'
import { AuthContext } from '../contexts/auth'
import { moveIndex } from '../utils/moveIndex'
import { ListEntry } from './scaffold/listEntry'
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

  const formattedDate = format(new Date(sessionDate), 'MM/dd/yyyy')
  const [formState, setFormState] = useState({ sessionDate: formattedDate })

  const [entries, setEntries] = useState(songs)
  useEffect(() => setEntries(songs), [songs])

  const getFormDate = () => {
    const date = parse(formState.sessionDate, 'MM/dd/yyyy', new Date())

    if (!isValid(date)) {
      console.log('Invalid date!')
      return null
    }

    return date
  }

  const handleCreateRecord = async (body) => {
    const response = await createRecord(body)
    response._id
      ? addEntry(response)
      : console.log(response)
  }

  const handleUpdateRecord = async (id, body) => {
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

  const handleSubmitSession = () => {
    const formDate = getFormDate()
    if (!formDate) return null

    const player = targetId ? {} : { player: id }

    const body = {
      payload: {
        songs: [...entries],
        sessionDate: formDate,
        ...player
      }
    }

    targetId
      ? handleUpdateRecord(targetId, body)
      : handleCreateRecord(body)
  }

  const setFormValue = (event) => {
    const { name, value } = event.target
    const nextState = { ...formState }
    nextState[name] = value

    setFormState(nextState)
  }

  const formField = (field, label, options = []) => generateFormField(field, label, formState, setFormValue, options)

  const sessionItems = entries
    .map((song, i) => {
      const { id, title, difficulty, numPads, record: { passed } } = song
      const handleRemoveFromSession = () => remove(i)
      const isBeginning = i === 0
      const isEnd = i === songs.length - 1

      const handleMoveUp = () => move(i, i - 1)
      const handleMoveDown = () => move(i, i + 1)

      const handleSelectEdit = () => setEditTarget(i)
      const handleEdit = (state) => edit(i, state)

      const editing = editTarget === i

      const style = numPads === 2 ? 'Double' : 'Single'

      return (
        <ListEntry key={id}>
          <Column.Group>
            <Column size='four-fifths'>
              <Content size='small'>
                <h5>
                  <Link to={`/song/${id}`}>{title}</Link>
                </h5>
                {!editing
                  ? (
                    <>
                      <p>{style}, {difficulty}</p>
                      {/* <p>Level: placeholder</p>
                        TODO: API and form updates */}
                      <p>Record: {passed ? 'Cleared' : 'Failed'}</p>
                    </>
                  )
                  : (
                    <SessionQueueForm
                      song={song}
                      setOuterTarget={clearEditTarget}
                      handleSubmit={handleEdit}
                    />
                  )}
              </Content>
            </Column>
            {!editing && (
              <Column>
                <Button size='small' onClick={handleRemoveFromSession}>Clear</Button>
                <Button size='small' onClick={handleSelectEdit}>Edit</Button>
                {!isBeginning && <Button size='small' onClick={handleMoveUp}><IoIosArrowUp /></Button>}
                {!isEnd && <Button size='small' onClick={handleMoveDown}><IoIosArrowDown /></Button>}
              </Column>
            )}
          </Column.Group>
        </ListEntry>
      )
    })

  return (
    <Container>
      {sessionItems}
      {formField('sessionDate', 'Session Date')}
      <Button onClick={handleSubmitSession}>Save session!</Button>
    </Container>
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
  )].map(count => ({
    key: count,
    text: count === 2 ? 'Double' : 'Single'
  }))

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
      <Container className='menuOptions'>
        {formField('numPads', 'Style', availablePads)}
        {formField('difficulty', 'Difficulty', availableDifficulties)}
        {formField('record.passed', 'Passed?', boolPair)}
      </Container>
      <Button size='small' onClick={cancelSubmit}>Cancel</Button>
      <Button size='small' onClick={handleSelectSubmit}>{submitText}</Button>
    </>
  )
}

export const Session = () => {
  const { entries, queue, setEntries, deleteEntry } = useContext(context)
  const { user: { id: playerId, isAdmin } } = useContext(AuthContext)

  const { songs = [] } = queue

  const location = useLocation()
  const isHidden = !location.pathname.replace(/\//g, '').endsWith(path)

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

  const sessionsList = entries.length && entries.map(entry => {
    const { sessionDate, _id: id, player } = entry
    const { username } = player
    const submitDelete = () => handleDeleteRecord(id)
    const setDeleteConfirmation = () => setDeleteTarget(id)
    const cancelDelete = () => setDeleteTarget(initialTargetId)

    const DeleteConfirmation = () => (
      <>
        <Button size='small' onClick={cancelDelete}>Cancel Delete</Button>
        <Button size='small' onClick={submitDelete}>Confirm Delete</Button>
      </>
    )

    const date = format(new Date(sessionDate), 'MM/dd/yyyy')

    const canDelete = playerId === player.id || isAdmin

    return (
      <ListEntry key={id}>
        <Column.Group>
          <Column size='four-fifths'>
            <Content>
              <h4>
                <Link to={`/session/${id}`}>{date}</Link>
              </h4>
              <p>Player: {username}</p>
            </Content>
          </Column>
          {canDelete && (
            <Column>
              {(deleteTarget === id
                ? <DeleteConfirmation />
                : <Button size='small' onClick={setDeleteConfirmation}>Delete</Button>)}
            </Column>
          )}
        </Column.Group>
      </ListEntry>
    )
  })

  return (
    <div className={isHidden ? 'isHidden' : ''}>
      <Title>{path}s</Title>
      <Container className='transition'>
        <Content className='frost'>
          <h5>Current session:</h5>
          {songs.length
            ? <SessionQueue songs={songs} />
            : <p>Session is empty!</p>}
        </Content>
        {sessionsList
          ? (
            <Container className='frost'>
              {sessionsList}
            </Container>
          )
          : null}
      </Container>
    </div>
  )
}

export const SessionDetail = () => {
  const { detail, setDetail, updateEntry } = useContext(context)
  const { songs, player: { username: player }, sessionDate } = detail
  const { user: { username } } = useContext(AuthContext)
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

  const songRecords = songs.map(({ id, title, numPads, difficulty, record: { passed } }) => {
    const style = numPads === 2 ? 'Double' : 'Single'
    return (
      <ListEntry key={id}>
        <Column.Group>
          <Column>
            <Content size='small'>
              <h5>
                <Link to={`/song/${id}`}>{title}</Link>
              </h5>
              <p>{style}, {difficulty}</p>
              <p>Record: {passed ? 'Cleared' : 'Failed'}</p>
            </Content>
          </Column>
        </Column.Group>
      </ListEntry>
    )
  })

  const passed = songs.filter(song => song.record.passed)
  const date = sessionDate && format(new Date(sessionDate), 'MM/dd/yyyy')

  const PageContent = (
    <Container className='transition'>
      <h5>Songs:</h5>
      {songRecords}
    </Container>
  )

  const editText = updating ? 'Cancel Edit' : 'Edit'

  const handleBack = () => history.goBack()

  return (
    <Content size='small'>
      <Title>{path} Detail</Title>
      <Container className='transition frost'>
        <Column.Group>
          <Column size='four-fifths'>
            <h5>Info:</h5>
            <p>Date: {date}</p>
            <p>Player: {player}</p>
            <p>Total songs: {songs.length} </p>
            <p>Total passed: {passed.length} </p>
          </Column>
          <Column>
            {username && <Button size='small' onClick={handleToggleEdit}>{editText}</Button>}
            <Button size='small' onClick={handleBack}>Go back!!</Button>
          </Column>
        </Column.Group>
        {updating
          ? <SessionQueue targetId={id} updateOuterState={handleToggleEdit} />
          : PageContent}
      </Container>
    </Content>
  )
}
