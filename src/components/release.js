import React, { useContext, useEffect, useState } from 'react'
import { Title, Content, Column, Button, Table, Container, Loader } from 'rbx'
import { Link, useLocation, useHistory } from 'react-router-dom'
import { format, parse, isValid } from 'date-fns'
import { addRelease, getAllReleases, getReleaseById, updateRelease, deleteRelease } from '../api/release'
import { ReleaseContext } from '../contexts/release'
import { SessionQueueForm } from './session'
import { SessionContext } from '../contexts/session'
import { AuthContext } from '../contexts/auth'
import { generateFormField } from './scaffold/formField'

const [
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord
] = [
  addRelease,
  getAllReleases,
  getReleaseById,
  updateRelease,
  deleteRelease
]
const context = ReleaseContext
const initialFormState = {
  title: '',
  scale: 'DDR', // DDR (classic), DDR X, ITG
  numPanels: 4, // chart type -- DDR, Pump, StepmaniaX, etc.
  releaseDate: '09/26/1998',
  releaseType: 'official' // first or third party
}
const initialTargetId = ''
const path = 'release'

export const Release = () => {
  const { user: { isAdmin } } = useContext(AuthContext)
  const { entries, setEntries, addEntry, deleteEntry } = useContext(context)
  const [creating, setCreating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(initialTargetId)
  const [loading, setLoading] = useState(false)

  const location = useLocation()
  const isHidden = !location.pathname.replace(/\//g, '').endsWith(path)

  useEffect(() => {
    async function getRecords () {
      const releases = await getAllRecords()
      setEntries(releases)
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

  const releasesList = entries && entries.map(entry => {
    const { title, _id } = entry
    const id = _id
    const confirmDelete = () => handleDeleteRecord(id)
    const setDeleteConfirmation = () => setDeleteTarget(id)
    const cancelDelete = () => setDeleteTarget(initialTargetId)

    const DeleteConfirmation = () => (
      <>
        <Button size='small' onClick={cancelDelete}>Cancel Delete</Button>
        <Button size='small' onClick={confirmDelete}>Confirm Delete</Button>
      </>
    )

    return (
      <Container className='listEntry' key={id}>
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
                : <Button size='small' onClick={setDeleteConfirmation}>Delete</Button>}
            </Column>
          )}
        </Column.Group>
      </Container>
    )
  })

  return (
    <div className={isHidden ? 'isHidden' : ''}>
      <Title>{path}s</Title>
      {loading
        ? <Loader />
        : (
          <Container className='transition frost'>
            {releasesList}
          </Container>
        )}
      {isAdmin && <Button onClick={handleSetCreating}>Add new</Button>}
      {creating && <ReleaseForm setSubmitting={setCreating} />}
    </div>
  )
}

const ReleaseForm = ({ targetId, setSubmitting }) => {
  const { detail, setDetail, addEntry, updateEntry } = useContext(context)
  const { release } = detail
  const [formState, setFormState] = useState(initialFormState)

  useEffect(() => {
    const { title, scale, releaseDate, numPanels, releaseType } = release
    const formData = targetId
      ? { title, numPanels, releaseDate: format(releaseDate, 'MM/dd/yyyy'), releaseType, scale }
      : initialFormState

    setFormState(formData)
  }, [release])

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
      const newDetail = { ...detail, release: response }
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
      {formField('releaseDate', 'Release date (MM/DD/YYYY)')}
      {formField('releaseType', 'Release type', ['Arcade', 'Console', 'Custom'])}
      <Button onClick={targetId ? submitForm : handleCreateRecord}>
        {submitButtonText}
      </Button>
      <Button onClick={cancelSubmitForm}>Cancel</Button>
    </>
  )
}

export const ReleaseDetail = () => {
  const { detail, setDetail, deleteEntry } = useContext(context)
  const { addToCurrentSession } = useContext(SessionContext)
  const { user: { username, isAdmin } } = useContext(AuthContext)
  const history = useHistory()
  const [updating, setUpdating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sessionTarget, setSessionTarget] = useState(initialTargetId)

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

  const songsMap = detail.songs.map(song => {
    const id = song._id
    const { title } = song

    const setSessionPrompt = () => setSessionTarget(id)

    return (
      <Table.Row key={id}>
        <Table.Cell>
          <Link to={`/song/${id}`}>{title}</Link>
        </Table.Cell>

        {username && (
          <Table.Cell>
            {sessionTarget === id
              ? <SessionQueueForm
                song={song}
                setOuterTarget={setSessionTarget}
                handleSubmit={addToCurrentSession}
                />
              : <Button size='small' onClick={setSessionPrompt}>Add to session</Button>}
          </Table.Cell>
        )}
      </Table.Row>
    )
  })

  const PageContent = () => {
    const { release: { title, releaseDate, scale, numPanels, releaseType } } = detail
    return (
      <>
        <h1>Title: {title}</h1>
        {releaseDate && <h1>Release Date: {format(new Date(releaseDate), 'MM/dd/yyyy')}</h1>}
        {scale && <h1>Scale: {scale}</h1>}
        <h1>Number of Panels: {numPanels}</h1>
        {releaseType && <h1>Release Type: {releaseType}</h1>}
      </>
    )
  }

  const handleBack = () => history.goBack()
  const editText = updating ? 'Cancel Edit' : 'Edit'

  return loading ? <Loader /> : (
    <>
      {isAdmin &&
        <Button onClick={handleSelectEdit}>{editText}</Button>}
      <Button onClick={handleBack}>Go back!!</Button>
      {updating
        ? (
          <ReleaseForm
            targetId={id}
            setSubmitting={setUpdating}
          />
        )
        : <PageContent />}
      <h1>Songs:</h1>
      <Table hoverable>
        <Table.Head>
          <Table.Row>
            <Table.Heading>Title</Table.Heading>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {songsMap}
        </Table.Body>
      </Table>
    </>
  )
}
