import React, { useContext, useEffect, useState } from 'react'
import { Link, useLocation, useHistory } from 'react-router-dom'
import { Column, Container, Content, Title } from 'rbx'
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io'
import { parse, format, isValid } from 'date-fns'
import { addSetlist, getAllSetlists, getSetlistById, updateSetlist, deleteSetlist } from '../api/setlist'
import { SetlistContext } from '../contexts/setlist'
import { AuthContext } from '../contexts/auth'
import { moveIndex } from '../utils/moveIndex'
import { ListEntry } from './scaffold/listEntry'
import { BulmaButton } from './scaffold/styled'
import { generateFormField } from './scaffold/formField'

const context = SetlistContext
const [
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord
] = [
  addSetlist,
  getAllSetlists,
  getSetlistById,
  updateSetlist,
  deleteSetlist
]
const initialTargetId = ''
const path = 'setlist'

export const SetlistQueue = ({ targetId, updateOuterState }) => {
  const { detail, queue, setDetail, updateCurrentSetlist, addEntry, updateEntry } = useContext(context)
  const { user: { id } } = useContext(AuthContext)
  const { songs, setlistDate = new Date() } = targetId
    ? detail
    : queue

  const [editTarget, setEditTarget] = useState(null)
  const clearEditTarget = () => setEditTarget(null)

  const formattedDate = format(new Date(setlistDate), 'MM/dd/yyyy')
  const [formState, setFormState] = useState({ setlistDate: formattedDate })

  const [entries, setEntries] = useState(songs)
  useEffect(() => setEntries(songs), [songs])

  const getFormDate = () => {
    const date = parse(formState.setlistDate, 'MM/dd/yyyy', new Date())

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
    : updateCurrentSetlist(arr)

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

  const handleSubmitSetlist = () => {
    const formDate = getFormDate()
    if (!formDate) return null

    const player = targetId ? {} : { player: id }

    const body = {
      payload: {
        songs: [...entries],
        setlistDate: formDate,
        ...player
      }
    }

    targetId
      ? handleUpdateRecord(targetId, body)
      : handleCreateRecord(body)
  }

  const setFormValue = (event) => {
    const { name, value } = event.target
    console.log({ name, value })

    const nextState = { ...formState }
    nextState[name] = value

    setFormState(nextState)
  }

  const formField = (field, label, options = []) => generateFormField(field, label, formState, setFormValue, options)

  const setlistItems = entries
    .map((song, i) => {
      const { id, title, difficulty, numPads, record: { passed, percent } } = song
      const handleRemoveFromSetlist = () => remove(i)
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
                      <p>Record:</p>
                      <ul>
                        <li>{passed ? 'Cleared' : 'Failed'}</li>
                        {percent && (<li>{percent}%</li>)}
                      </ul>
                    </>
                    )
                  : (
                    <SetlistQueueForm
                      song={song}
                      setOuterTarget={clearEditTarget}
                      handleSubmit={handleEdit}
                    />
                    )}
              </Content>
            </Column>
            {!editing && (
              <Column>
                <BulmaButton onClick={handleRemoveFromSetlist}>Clear</BulmaButton>
                <BulmaButton onClick={handleSelectEdit}>Edit</BulmaButton>
                {!isBeginning && <BulmaButton onClick={handleMoveUp}><IoIosArrowUp /></BulmaButton>}
                {!isEnd && <BulmaButton onClick={handleMoveDown}><IoIosArrowDown /></BulmaButton>}
              </Column>
            )}
          </Column.Group>
        </ListEntry>
      )
    })

  return (
    <Container>
      {setlistItems}
      <Container id='setlistSubmit'>
        {formField('setlistDate', 'Session Date')}
        <BulmaButton onClick={handleSubmitSetlist}>Save setlist!</BulmaButton>
      </Container>
    </Container>
  )
}

export const SetlistQueueForm = ({ song, setOuterTarget, handleSubmit }) => {
  const cancelSubmit = () => setOuterTarget(initialTargetId)
  const { title, charts, difficulty = 'expert' } = song // TODO: difficulty as user setting

  const id = song.song || song._id
  const passed = song.record ? song.record.passed : true
  const percent = song.record ? song.record.percent : null

  const setlistQueueFormState = {
    song: id,
    title,
    passed,
    percent,
    numPads: 1,
    difficulty
  }
  const [formState, setFormState] = useState(setlistQueueFormState)

  const handleSelectSubmit = () => {
    const { title, passed, percent, numPads, difficulty } = formState
    handleSubmit({
      song: id,
      title,
      numPads,
      difficulty,
      record: {
        passed: JSON.parse(passed),
        percent: Number(percent)
      },
      charts
    })
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
        {formField('passed', 'Passed?', boolPair)}
        {formField('percent', 'Percent')}
      </Container>
      <BulmaButton onClick={cancelSubmit}>Cancel</BulmaButton>
      <BulmaButton onClick={handleSelectSubmit}>{submitText}</BulmaButton>
    </>
  )
}

export const Setlist = () => {
  const { entries, queue, setEntries, deleteEntry } = useContext(context)
  const { user: { id: playerId, isAdmin } } = useContext(AuthContext)

  const { songs = [] } = queue

  const location = useLocation()
  const isHidden = !location.pathname.replace(/\//g, '').endsWith(path)

  const [deleteTarget, setDeleteTarget] = useState(initialTargetId)

  useEffect(() => {
    async function getRecords () {
      const setlists = await getAllRecords()
      setEntries(setlists)
    }
    getRecords()
  }, [])

  const handleDeleteRecord = async (id) => {
    const response = await deleteRecord(id)
    response._id
      ? deleteEntry(response)
      : console.log(response)
  }

  const setlistsList = entries.length && entries.map(entry => {
    const { setlistDate, _id: id, player } = entry
    const { username } = player
    const submitDelete = () => handleDeleteRecord(id)
    const setDeleteConfirmation = () => setDeleteTarget(id)
    const cancelDelete = () => setDeleteTarget(initialTargetId)

    const DeleteConfirmation = () => (
      <>
        <BulmaButton onClick={cancelDelete}>Cancel Delete</BulmaButton>
        <BulmaButton onClick={submitDelete}>Confirm Delete</BulmaButton>
      </>
    )

    const date = format(new Date(setlistDate), 'MM/dd/yyyy')

    const canDelete = playerId === player.id || isAdmin

    return (
      <ListEntry key={id}>
        <Column.Group>
          <Column size='four-fifths'>
            <Content>
              <h4>
                <Link to={`/setlist/${id}`}>{date}</Link>
              </h4>
              <p>Player: {username}</p>
            </Content>
          </Column>
          {canDelete && (
            <Column>
              {deleteTarget === id
                ? <DeleteConfirmation />
                : <BulmaButton onClick={setDeleteConfirmation}>Delete</BulmaButton>}
            </Column>
          )}
        </Column.Group>
      </ListEntry>
    )
  })

  return (
    <div className={isHidden ? 'isHidden' : ''}>
      <Title>{path}s</Title>
      <Content className='transition'>
        <h5>Current setlist:</h5>
        {songs.length
          ? <SetlistQueue songs={songs} />
          : <p className='pageContent'>Setlist is empty!</p>}
        {setlistsList
          ? (
            <>
              <h5>Saved setlists:</h5>
              {setlistsList}
            </>
            )
          : null}
      </Content>
    </div>
  )
}

export const SetlistDetail = () => {
  const { detail, setDetail, updateEntry } = useContext(context)
  const { songs, player: { username: player }, setlistDate } = detail
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

  const songRecords = songs.map(({ id, title, numPads, difficulty, record: { passed, percent } }) => {
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
              <p>Record:</p>
              <ul>
                <li>{passed ? 'Cleared' : 'Failed'}</li>
                {percent && (<li>{percent}%</li>)}
              </ul>
            </Content>
          </Column>
        </Column.Group>
      </ListEntry>
    )
  })

  const passedSongs = songs.filter(song => song.record.passed)
  const date = setlistDate && format(new Date(setlistDate), 'MM/dd/yyyy')

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
      <Container className='transition'>
        <Column.Group>
          <Column size='four-fifths'>
            <h5>Info:</h5>
            <p>Date: {date}</p>
            <p>Player: {player}</p>
            <p>Total songs: {songs.length} </p>
            <p>Total passed: {passedSongs.length} </p>
          </Column>
          <Column>
            {username && <BulmaButton onClick={handleToggleEdit}>{editText}</BulmaButton>}
            <BulmaButton onClick={handleBack}>Go back!!</BulmaButton>
          </Column>
        </Column.Group>
        {updating
          ? <SetlistQueue targetId={id} updateOuterState={handleToggleEdit} />
          : PageContent}
      </Container>
    </Content>
  )
}
