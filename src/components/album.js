import React, { useContext, useEffect, useState } from 'react'
import { Title, Content, Container, Column, Loader } from 'rbx'
import { Link, useLocation, useHistory } from 'react-router-dom'
import { format, parse, isValid } from 'date-fns'
import { addAlbum, getAllAlbums, getAlbumById, updateAlbum, deleteAlbum } from '../api/album'
import { AlbumContext } from '../contexts/album'
import { SetlistQueueForm } from './setlist'
import { SetlistContext } from '../contexts/setlist'
import { AuthContext } from '../contexts/auth'
import { BulmaButton } from './scaffold/styled'
import { ListEntry } from './scaffold/listEntry'
import { generateFormField } from './scaffold/formField'

const [
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord
] = [
  addAlbum,
  getAllAlbums,
  getAlbumById,
  updateAlbum,
  deleteAlbum
]
const context = AlbumContext
const initialFormState = {
  title: '',
  scale: 'DDR', // DDR (classic), DDR X, ITG
  numPanels: 4, // chart type -- DDR, Pump, StepmaniaX, etc.
  releaseDate: '09/26/1998',
  albumType: 'official' // first or third party
}
const initialTargetId = ''
const path = 'album'

export const Album = () => {
  const { user: { isAdmin } } = useContext(AuthContext)
  const { entries, setEntries, addEntry, deleteEntry } = useContext(context)
  const [creating, setCreating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(initialTargetId)
  const [loading, setLoading] = useState(false)

  const location = useLocation()
  const isHidden = !location.pathname.replace(/\//g, '').endsWith(path)

  useEffect(() => {
    async function getRecords () {
      const albums = await getAllRecords()
      setEntries(albums)
      setLoading(false)
    }
    getRecords()
  }, [])

  const handleDeleteRecord = async (id) => {
    const response = await deleteRecord(id)
    response._id
      ? deleteEntry(response)
      : console.log(response)
  }

  const handleSetCreating = () => setCreating(true)

  const albumsList = entries && entries.map(entry => {
    const { title, _id } = entry
    const id = _id
    const confirmDelete = () => handleDeleteRecord(id)
    const setDeleteConfirmation = () => setDeleteTarget(id)
    const cancelDelete = () => setDeleteTarget(initialTargetId)

    const DeleteConfirmation = () => (
      <>
        <BulmaButton onClick={cancelDelete}>Cancel Delete</BulmaButton>
        <BulmaButton onClick={confirmDelete}>Confirm Delete</BulmaButton>
      </>
    )

    return (
      <ListEntry key={id}>
        <Column.Group>
          <Column size='four-fifths'>
            <Content>
              <h6>
                <Link to={`/${path}/${id}`}>{title}</Link>
              </h6>
            </Content>
          </Column>
          {isAdmin && (
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
      {loading || !albumsList.length
        ? <Loader />
        : (
          <Container className='transition'>
            {albumsList}
          </Container>
        )}
      {isAdmin && <BulmaButton onClick={handleSetCreating}>Add new</BulmaButton>}
      {creating && <AlbumForm setSubmitting={setCreating} />}
    </div>
  )
}

const AlbumForm = ({ targetId, setSubmitting }) => {
  const { detail, setDetail, addEntry, updateEntry } = useContext(context)
  const { album } = detail
  const [formState, setFormState] = useState(initialFormState)

  useEffect(() => {
    const { title, scale, releaseDate, numPanels, albumType } = album
    const formData = targetId
      ? { title, numPanels, releaseDate: format(releaseDate, 'MM/dd/yyyy'), albumType, scale }
      : initialFormState

    setFormState(formData)
  }, [album])

  const setFormValue = (event) => {
    const { name, value } = event.target
    const nextState = { ...formState }
    nextState[name] = value

    setFormState(nextState)
  }

  const handleUpdateRecord = async (id) => {
    const body = {
      payload: { ...formState }
    }

    const response = await updateRecord(id, body)
    if (response._id) {
      const newDetail = { ...detail, album: response }
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
    ? `Update ${path}!`
    : `Add new ${path}!`

  const submitForm = () => {
    const date = parse(formState.releaseDate, 'MM/dd/yyyy', new Date())

    if (!isValid(date)) {
      console.log('Invalid date!')
      return null
    }

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

  const formField = (field, label, options = []) => generateFormField(field, label, formState, setFormValue, options)

  return (
    <>
      {formField('title', 'Title')}
      {formField('scale', 'Scale', ['DDR', 'DDR X', 'ITG'])}
      {formField('numPanels', 'Number of panels')}
      {formField('releaseDate', 'Album date (MM/DD/YYYY)')}
      {formField('albumType', 'Album type', ['Arcade', 'Console', 'Custom'])}
      <BulmaButton onClick={targetId ? submitForm : handleCreateRecord}>
        {submitButtonText}
      </BulmaButton>
      <BulmaButton onClick={cancelSubmitForm}>Cancel</BulmaButton>
    </>
  )
}

export const AlbumDetail = () => {
  const { detail: { album, songs }, setDetail, deleteEntry } = useContext(context)
  const { addToCurrentSetlist } = useContext(SetlistContext)
  const { user: { username, isAdmin } } = useContext(AuthContext)
  const history = useHistory()
  const [updating, setUpdating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [setlistTarget, setSetlistTarget] = useState(initialTargetId)

  const handleSelectEdit = () => setUpdating(true)

  const location = useLocation()
  const routeId = location.pathname.replace(`/${path}/`, '')

  const handleGetRecord = async (id) => {
    const response = await getRecordById(id)
    setDetail(response)
    setLoading(false)
  }

  useEffect(() => {
    async function getDetail () {
      handleGetRecord(routeId)
    }
    getDetail()
  }, [routeId])

  const songsMap = songs.map(song => {
    const id = song._id
    const { title } = song

    const setSetlistPrompt = () => setSetlistTarget(id)

    return (
      <ListEntry key={id}>
        <Column.Group>
          <Column>
            <Content size='small'>
              <h5>
                <Link to={`/song/${id}`}>{title}</Link>
              </h5>
            </Content>
            {username && (
              <>
                {setlistTarget === id
                  ? (
                    <SetlistQueueForm
                      song={song}
                      setOuterTarget={setSetlistTarget}
                      handleSubmit={addToCurrentSetlist}
                    />
                  )
                  : <BulmaButton onClick={setSetlistPrompt}>Add to setlist</BulmaButton>}
              </>
            )}
          </Column>
        </Column.Group>
      </ListEntry>
    )
  })

  const PageContent = () => {
    const { title, releaseDate, scale, numPanels, albumType } = album
    return (
      <Content className='pageContent'>
        <p>Title: {title}</p>
        {releaseDate &&
          <p>Album Date: {format(new Date(releaseDate), 'MM/dd/yyyy')}</p>}
        {scale &&
          <p>Scale: {scale}</p>}
        <p>Number of Panels: {numPanels}</p>
        {albumType &&
          <p>Album Type: {albumType}</p>}
      </Content>
    )
  }

  const handleBack = () => history.goBack()
  const editText = updating ? 'Cancel Edit' : 'Edit'

  return loading ? <Loader /> : (
    <Content size='small'>
      <Title>{path} Detail</Title>
      <Column.Group>
        <Column size='four-fifths'>
          <h4>Info:</h4>
          {updating
            ? (
              <AlbumForm
                targetId={routeId}
                setSubmitting={setUpdating}
              />
            )
            : <PageContent />}
        </Column>
        <Column>
          {isAdmin &&
            <BulmaButton onClick={handleSelectEdit}>{editText}</BulmaButton>}
          <BulmaButton onClick={handleBack}>Go back!!</BulmaButton>
        </Column>
      </Column.Group>
      <h5>Songs:</h5>
      {songsMap}
    </Content>
  )
}
