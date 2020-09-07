import React, { useContext, useEffect, useState } from 'react'
import { Title, Button, Table } from 'rbx'
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

  const location = useLocation()
  const isHidden = !location.pathname.replace(/\//g, '').endsWith(path)

  useEffect(() => {
    async function getRecords () {
      const releases = await getAllRecords()
      setEntries(releases)
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

  const entriesList = entries && entries.map(entry => {
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
      <Table.Row key={id}>
        <Table.Cell>
          <Link to={`/${path}/${id}`}>{title}</Link>
        </Table.Cell>
        <Table.Cell>
          {
            deleteTarget === id
              ? <DeleteConfirmation />
              : isAdmin &&
                <Button size='small' onClick={setDeleteConfirmation}>Delete</Button>
          }
        </Table.Cell>
      </Table.Row>
    )
  })

  return (
    <div className={isHidden && 'isHidden'}>
      <Title>{path}s</Title>
      <Table>
        <Table.Body>
          {entriesList}
        </Table.Body>
      </Table>
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
      {formField('releaseDate', 'Release date (MM/dd/yyyy)')}
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
  const { username, isAdmin } = useContext(AuthContext)
  const history = useHistory()
  const [updating, setUpdating] = useState(false)
  const [sessionTarget, setSessionTarget] = useState(initialTargetId)

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

  const songsMap = detail.songs.map(song => {
    const id = song._id
    const { title } = song

    const setSessionPrompt = () => setSessionTarget(id)

    return (
      <Table.Row key={id}>
        <Table.Cell>
          <Link to={`/song/${id}`}>{title}</Link>
        </Table.Cell>

        <Table.Cell>
          {sessionTarget === id
            ? <SessionQueueForm
              song={song}
              setOuterTarget={setSessionTarget}
              handleSubmit={addToCurrentSession}
              />
            : <Button size='small' onClick={setSessionPrompt}>Add to session</Button>}
        </Table.Cell>
      </Table.Row>
    )
  })

  const content = Object.keys(detail.release)
    .filter(key => !['_id', '__v'].includes(key))
    .map(key => <h1 key={key}>{key}: {detail.release[key]}</h1>)

  const handleBack = () => history.goBack()
  const editText = updating ? 'Cancel Edit' : 'Edit'

  return (
    <>
      {isAdmin &&
        <Button onClick={handleSelectEdit}>{editText}</Button>}
      <Button onClick={handleBack}>Go back!!</Button>
      {updating
        ? <ReleaseForm
          targetId={id}
          setSubmitting={setUpdating}
          />
        : content}
      <h1>Songs:</h1>
      <Table>
        <Table.Body>
          {songsMap}
        </Table.Body>
      </Table>
    </>
  )
}
