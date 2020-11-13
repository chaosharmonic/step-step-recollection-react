import React, { useContext, useEffect, useState, useRef } from 'react'
import { Column, Container, Title, Button, Content, Loader } from 'rbx'
import { Link, useHistory, useLocation } from 'react-router-dom'
import { debounce } from 'lodash-es'
import { addSong, getAllSongs, getSongById, updateSong, deleteSong } from '../api/song'
import { SongContext } from '../contexts/song'
import { SessionQueueForm } from './session'
import { SessionContext } from '../contexts/session'
import { AuthContext } from '../contexts/auth'
import { ListEntry } from './scaffold/listEntry'
import { generateFormField } from './scaffold/formField'
import { Paginate } from './scaffold/paginate'

const [
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord
] = [
  addSong,
  getAllSongs,
  getSongById,
  updateSong,
  deleteSong
]
const context = SongContext

const initialFormState = {
  title: '',
  artist: '',
  release: '',
  length: 0,
  bpmDisplay: '',
  chart_single_beginner: 0,
  chart_single_easy: 0,
  chart_single_difficult: 0,
  chart_single_expert: 0,
  chart_single_challenge: 0,
  chart_double_beginner: 0,
  chart_double_easy: 0,
  chart_double_difficult: 0,
  chart_double_expert: 0,
  chart_double_challenge: 0
}

const initialTargetId = ''
const path = 'song'
const constructCharts = (form) => {
  const charts = Object.keys(form)
    .filter(key => key.includes('chart'))
    .map(key => {
      const data = key.split('_').slice(1)
      const numPads = data[0] === 'single'
        ? 1
        : 2

      const difficulty = data[1]
      return {
        numPads,
        difficulty,
        level: form[key]
      }
    }).filter(e => e.level)

  return charts
}

export const Song = () => {
  const { entries, pageCount, setEntries, setPages, deleteEntry } = useContext(context)
  const { user: { username, isAdmin } } = useContext(AuthContext)
  const [creating, setCreating] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [fetchTarget, setFetchTarget] = useState(1)

  const [menuTarget, setMenuTarget] = useState(initialTargetId)
  const [deleteTarget, setDeleteTarget] = useState(initialTargetId)
  const [sessionTarget, setSessionTarget] = useState(initialTargetId)
  const [loading, setLoading] = useState(true)

  const location = useLocation()
  const isHidden = !location.pathname.replace(/\//g, '').endsWith(path)

  useEffect(() => {
    async function getRecords () {
      const { docs, pageCount } = await getAllRecords()
      setEntries(docs)
      setPages(pageCount)
    }
    getRecords()
  }, [])

  useEffect(() => {
    async function renderNextPage () {
      await getPage(fetchTarget)
    }
    renderNextPage()
  }, [fetchTarget])

  useEffect(() => setLoading(false), [entries])

  const getPage = async (page) => {
    const response = await getAllSongs(page)
    response.docs
      ? setEntries(response.docs)
      : console.log(response)
  }

  const debouncePageFetch = useRef(
    debounce((page) => setFetchTarget(page), 1000)
  ).current

  const handleChangePage = (page) => {
    if (!loading) setLoading(true)
    setCurrentPage(page)
    debouncePageFetch(page)
  }

  const handleDeleteRecord = async (id) => {
    const response = await deleteRecord(id)
    response._id
      ? deleteEntry(response)
      : console.log(response)
  }

  const handleSetCreating = () => setCreating(true)

  const SongEntry = ({ song }) => {
    const { title, release, _id: id } = song
    const { addToCurrentSession } = useContext(SessionContext)
    const submitDelete = () => handleDeleteRecord(id)
    const setDeletePrompt = () => setDeleteTarget(id)
    const cancelDelete = () => setDeleteTarget(initialTargetId)

    const setSessionPrompt = () => setSessionTarget(id)

    const toggleSongMenu = () => menuTarget === id
      ? setMenuTarget(initialTargetId)
      : setMenuTarget(id)
    const menuToggleText = menuTarget === id ? 'Collapse' : 'Expand'

    const DeleteConfirmation = () => (
      <>
        <Button size='small' onClick={cancelDelete}>Cancel Delete</Button>
        <Button size='small' onClick={submitDelete}>Confirm Delete</Button>
      </>
    )

    return (
      <ListEntry key={id}>
        <Column.Group>
          <Column size='four-fifths'>
            <Content size='small'>
              <h5>
                <Link to={`/${path}/${id}`}>{title}</Link>
              </h5>
              <h6>
                Release: <Link to={`/release/${release._id}`}>{release.title}</Link>
              </h6>
            </Content>
            {menuTarget === id && (
              <Container className='menu'>
                {sessionTarget === id
                  ? (
                    <SessionQueueForm
                      song={song}
                      setOuterTarget={setSessionTarget}
                      handleSubmit={addToCurrentSession}
                    />
                  )
                  : <Button size='small' onClick={setSessionPrompt}>Add to session</Button>}
                {isAdmin && (
                  <Container>
                    {deleteTarget === id
                      ? <DeleteConfirmation />
                      : <Button size='small' onClick={setDeletePrompt}>Delete</Button>}
                  </Container>
                )}
              </Container>
            )}
          </Column>
          {username && (
            <Column>
              <Button size='small' onClick={toggleSongMenu}>{menuToggleText}</Button>
            </Column>
          )}
        </Column.Group>
      </ListEntry>
    )
  }

  const songsList = entries && entries.map(song => <SongEntry key={song._id} song={song} />)

  return (
    <div className={isHidden ? 'isHidden' : ''}>
      <Title>{path}s</Title>
      {creating
        ? <SongForm setSubmitting={setCreating} />
        : isAdmin &&
          <Button onClick={handleSetCreating}>Add new</Button>}
      <Paginate
        getPage={handleChangePage}
        entries={entries}
        currentPage={currentPage}
        pageCount={pageCount}
      />
      {loading || !songsList.length
        ? <Loader />
        : (
          <Container className='transition'>
            {songsList}
          </Container>
        )}
    </div>
  )
}

const SongForm = ({ targetId, setSubmitting }) => {
  const { detail, setDetail, addEntry, updateEntry } = useContext(context)
  const [formState, setFormState] = useState(initialFormState)

  const setFormValue = (event) => {
    const { name, value } = event.target
    const nextState = { ...formState }
    nextState[name] = value

    setFormState(nextState)
  }

  const parseChartData = (chartData) => {
    const values = chartData.map(({ difficulty, numPads, level }) => {
      const style = numPads === 2
        ? 'double'
        : 'single'

      const newChartName = `chart_${style}_${difficulty}`

      return { [newChartName]: level }
    })

    const newCharts = values.reduce((a, b) => ({ ...a, ...b }))
    return newCharts
  }

  useEffect(() => {
    const { title, artist, release, length, bpm, charts } = detail
    const { display } = bpm || ''
    const formCharts = charts && charts.length
      ? parseChartData(charts)
      : []

    const formData = targetId
      ? { title, artist, release, length, bpmDisplay: display, ...formCharts }
      : initialFormState

    setFormState(formData)
  }, [detail])

  const formField = (field, label, options = []) => generateFormField(field, label, formState, setFormValue, options)

  const handleUpdateRecord = async (id) => {
    const charts = constructCharts(formState)

    const { title, artist, release, length, bpmDisplay } = formState
    const body = {
      payload: {
        title,
        artist,
        release,
        length,
        bpm: { display: bpmDisplay },
        charts
      }
    }

    const response = await updateRecord(id, body)
    if (response._id) {
      const newDetail = { ...detail, ...response }
      setDetail(newDetail)
    } else {
      console.log(response)
    }
  }

  const revertForm = () => setSubmitting(false)

  const cancelSubmitForm = () => {
    setFormState(initialFormState)
    revertForm()
  }

  const submitButtonText = targetId
    ? `Update ${path}`
    : `Add new ${path}!`

  const submitForm = () => {
    targetId && handleUpdateRecord(targetId)
    setFormState(initialFormState)
    revertForm()
  }

  const handleCreateRecord = async () => {
    const body = {
      payload: { ...formState }
    }
    const response = await createRecord(body)
    response._id
      ? addEntry(response)
      : console.log(response)

    setFormState(initialFormState)
  }

  return (
    <>
      <Column.Group>
        <Column>
          {formField('title', 'Title')}
          {formField('artist', 'Artist')}
          {formField('release', 'Release')}
          {formField('length', 'Length')}
          {formField('bpmDisplay', 'BPM')}
        </Column>
        <Column>
          {formField('chart_single_beginner', 'Single: Beginner')}
          {formField('chart_single_easy', 'Single: Easy')}
          {formField('chart_single_difficult', 'Single: Difficult')}
          {formField('chart_single_expert', 'Single: Expert')}
          {formField('chart_single_challenge', 'Single: Challenge')}
        </Column>
        <Column>
          {formField('chart_double_beginner', 'Double: Beginner')}
          {formField('chart_double_easy', 'Double: Easy')}
          {formField('chart_double_difficult', 'Double: Difficult')}
          {formField('chart_double_expert', 'Double: Expert')}
          {formField('chart_double_challenge', 'Double: Challenge')}
        </Column>
      </Column.Group>
      <Button onClick={targetId ? submitForm : handleCreateRecord}>
        {submitButtonText}
      </Button>
      <Button onClick={cancelSubmitForm}>Cancel</Button>
    </>
  )
}

export const SongDetail = () => {
  const { detail, setDetail, deleteEntry } = useContext(context)
  const { user: { isAdmin } } = useContext(AuthContext)
  const {
    title,
    titletranslit,
    artist,
    artisttranslit,
    release,
    length
    // bpmDisplay,
    // charts
  } = detail
  const history = useHistory()
  const [updating, setUpdating] = useState(false)
  const [loading, setLoading] = useState(true)

  const handleToggleEdit = () => {
    setUpdating(!updating)
  }

  const location = useLocation()
  const id = location.pathname.replace(`/${path}/`, '')

  const handleGetRecord = async (id) => {
    const response = await getRecordById(id)
    setDetail(response)
    setLoading(false)
  }

  useEffect(() => {
    async function getDetail () {
      handleGetRecord(id)
    }
    getDetail()
  }, [id])

  const PageContent = () => {
    if (!(title && artist && release)) return null
    return (
      <>
        <h4>{title}</h4>
        <Container className='pageContent'>
          {titletranslit && <p>Title (Romanized): {titletranslit}</p>}
          <p>Artist: {artist}</p>
          {artisttranslit && <p>Artist (Romanized): {artisttranslit}</p>}
          {length > 0 && <p>Length: {length}</p>}
          <p>Release: <Link to={`/release/${release._id}`}>{release.title}</Link></p>
        </Container>
      </>
    )
  }

  const handleBack = () => history.goBack()
  const editText = updating ? 'Cancel Edit' : 'Edit'

  return loading ? <Loader /> : (
    <Content size='small'>
      <Title>{path} detail</Title>
      <Container className='transition'>
        {updating
          ? (
            <SongForm
              targetId={id}
              setSubmitting={setUpdating}
            />
          )
          : <PageContent />}
        {isAdmin &&
          <Button onClick={handleToggleEdit}>{editText}</Button>}
        <Button onClick={handleBack}>Go back!!</Button>
      </Container>
    </Content>
  )
}

export default Song
