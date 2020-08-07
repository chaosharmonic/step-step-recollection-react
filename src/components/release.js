import React, { useContext, useEffect, useState } from 'react'
import { Button, Field, Control, Label, Input, Select, Table } from 'rbx'
import { Link, useLocation, useHistory } from 'react-router-dom'
import { addRelease, getAllReleases, getReleaseById, updateRelease, deleteRelease } from '../api/release'
import { ReleaseContext } from '../contexts/release'

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
  releaseYear: 1998,
  releaseType: 'official' // first or third party
}
const initialTargetId = ''
const path = 'release'

export const Release = () => {
  const { entries, setEntries, addEntry, deleteEntry } = useContext(context)
  const [creating, setCreating] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(initialTargetId)

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
    const submitDelete = () => handleDeleteRecord(id)
    const setDeleteConfirmation = () => setDeleteTarget(id)
    const cancelDelete = () => setDeleteTarget(initialTargetId)

    const DeleteConfirmation = () => (
      <>
        <Button size='small' onClick={cancelDelete}>Cancel Delete</Button>
        <Button size='small' onClick={submitDelete}>Confirm Delete</Button>
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
              : <Button size='small' onClick={setDeleteConfirmation}>Delete</Button>
          }
        </Table.Cell>
      </Table.Row>
    )
  })

  return (
    <>
      <h1>{path} route!</h1>
      <Table>
        <Table.Body>
          {entriesList}
        </Table.Body>
      </Table>
      <Button onClick={handleSetCreating}>Add new</Button>
      {creating && <ReleaseForm setSubmitting={setCreating} />}
    </>
  )
}

const ReleaseForm = ({ targetId, setSubmitting }) => {
  const { detail, setDetail, addEntry, updateEntry } = useContext(context)
  const { release } = detail
  const [formState, setFormState] = useState(initialFormState)

  useEffect(() => {
    const { title, scale, releaseYear, numPanels, releaseType } = release
    const formData = targetId
      ? { title, numPanels, releaseYear, releaseType, scale }
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

  const generateFormField = (field, options = []) => {
    const value = formState[field]

    const TextInput = () => (
      <Input
        type='text'
        placeholder={field}
        name={field}
        value={value}
        onChange={setFormValue}
      />
    )
    const SelectInput = () => {
      const selectOptions = options.length > 0 &&
      options.map(option => (
        <Select.Option
          key={option}
          value={option}
        >
          {option}
        </Select.Option>
      ))
      return (
        <Select
          onChange={setFormValue}
          value={value}
          name={field}
        >
          {selectOptions}
        </Select>
      )
    }

    return (
      <Field>
        <Label>{field}</Label>
        <Control>
          {options.length > 0
            ? SelectInput()
            : TextInput()}
        </Control>
      </Field>
    )
  }

  return (
    <>
      {generateFormField('title')}
      {generateFormField('scale', ['DDR', 'DDR X', 'ITG'])}
      {generateFormField('numPanels')}
      {generateFormField('releaseYear')}
      {generateFormField('releaseType', ['official', 'custom'])}
      <Button onClick={targetId ? submitForm : handleCreateRecord}>
        {submitButtonText}
      </Button>
      <Button onClick={cancelSubmitForm}>Cancel</Button>
    </>
  )
}

export const ReleaseDetail = () => {
  const { detail, setDetail, deleteEntry } = useContext(context)
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

  const songsMap = detail.songs.map(song => (
    <li key={song._id}>{song.title}</li>
  ))

  const content = Object.keys(detail.release)
    .filter(key => !['_id', '__v'].includes(key))
    .map(key => <h1 key={key}>{key}: {detail.release[key]}</h1>)

  const handleBack = () => history.goBack()

  return (
    <>
      <h1>{path} detail!</h1>
      {songsMap}
      <Button onClick={handleSelectEdit}>Edit</Button>
      <Button onClick={handleBack}>Go back!!</Button>
      {updating
        ? <ReleaseForm
          targetId={id}
          setSubmitting={setUpdating}
        />
        : content}
    </>
  )
}
