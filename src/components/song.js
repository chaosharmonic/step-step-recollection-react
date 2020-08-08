import React, { useContext, useEffect, useState } from 'react'
import { Column, Button, Field, Control, Label, Input, Select, Table, Modal } from 'rbx'
import { Link, useHistory, useLocation } from 'react-router-dom'
import { addSong, getAllSongs, getSongById, updateSong, deleteSong } from '../api/song'
import { SongContext } from '../contexts/song'
import { SessionContext } from '../contexts/session'

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
  release: '5f0c0131e4345b08ae33f24e',
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
  const { entries, setEntries, addEntry, deleteEntry } = useContext(context)
  const { addToCurrentSession } = useContext(SessionContext)
  const [creating, setCreating] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(initialTargetId)
  const [sessionTarget, setSessionTarget] = useState(initialTargetId)

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
    const setDeletePrompt = () => setDeleteTarget(id)
    const cancelDelete = () => setDeleteTarget(initialTargetId)

    const submitSessionQueueEntry = () => handleAddToSession()
    const setSessionPrompt = () => setSessionTarget(id)
    const cancelSessionSubmission = () => setSessionTarget(initialTargetId)

    const DeleteConfirmation = () => (
      <>
        <Button size='small' onClick={cancelDelete}>Cancel Delete</Button>
        <Button size='small' onClick={submitDelete}>Confirm Delete</Button>
      </>
    )

    // TODO: export this
    const SessionForm = ({ song }) => {
      const { id, title, charts } = song

      const sessionFormState = {
        id,
        title,
        record: {
          passed: true
        },
        numPads: 1,
        difficulty: 'expert'
      }
      const [formState, setFormState] = useState(sessionFormState)

      const availableCharts = charts.filter(chart => chart.level)

      const availablePads = [...new Set(charts
        .map(chart => chart.numPads)
      )]

      const availableDifficulties = availableCharts
        .filter(chart => Number(chart.numPads) === Number(formState.numPads))
        .sort((a, b) => a.level - b.level)
        .map(chart => `${chart.difficulty} - ${chart.level}`)

      const setFormValue = (event) => {
        const { name, value } = event.target
        const nextState = { ...formState }
        nextState[name] = value

        setFormState(nextState)
      }

      const formField = (field, options = []) => generateFormField(field, formState, setFormValue, options)

      return (
        <>
          {formField('numPads', availablePads)}
          {formField('difficulty', availableDifficulties)}
          {formField('record.passed', [true, false])}
          <Button size='small' onClick={cancelSessionSubmission}>Cancel</Button>
          <Button size='small' onClick={submitSessionQueueEntry}>Add to session</Button>
        </>
      )
    }

    const handleAddToSession = () => {
      const formData = {
        song: id,
        title,
        record: {
          passed: true
        },
        numPads: 1,
        difficulty: 'expert'
      }
      addToCurrentSession(formData)
      setSessionTarget(initialTargetId)
    }

    return (
      <Table.Row key={id}>
        <Table.Cell>
          <Link to={`/${path}/${id}`}>{title}</Link>
        </Table.Cell>
        <Table.Cell>
          {sessionTarget !== id && deleteTarget !== id &&
            <>
              <Button size='small' onClick={setSessionPrompt}>Add to session</Button>
              <Button size='small' onClick={setDeletePrompt}>Delete</Button>
            </>}
          {sessionTarget === id && <SessionForm song={entry} />}
          {deleteTarget === id &&
            <DeleteConfirmation />}
        </Table.Cell>
      </Table.Row>
    )
  })

  return (
    <>
      <h1>{path} route!</h1>
      {creating
        ? <SongForm setSubmitting={setCreating} />
        : <Button onClick={handleSetCreating}>Add new</Button>}
      <Table>
        <Table.Body>
          {entriesList}
        </Table.Body>
      </Table>
    </>
  )
}

const generateFormField = (field, state, handleSetFormValue, options = []) => {
  const value = state[field]

  const TextInput = () => (
    <Input
      type='text'
      placeholder={field}
      name={field}
      value={value}
      onChange={handleSetFormValue}
    />
  )
  const SelectInput = () => {
    const selectOptions = options.length > 0 &&
    options.map(option => (
      <Select.Option
        key={option}
        value={option}
      >
        {String(option)}
      </Select.Option>
    ))
    return (
      <Select
        onChange={handleSetFormValue}
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

  const formField = (field, options = []) => generateFormField(field, formState, setFormValue, options)

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
      const newDetail = { ...detail, song: response }
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

  return (
    <>
      <Column.Group>
        <Column>
          {formField('title')}
          {formField('artist')}
          {formField('release')}
          {formField('length')}
          {formField('bpmDisplay')}
        </Column>
        <Column>
          {formField('chart_single_beginner')}
          {formField('chart_single_easy')}
          {formField('chart_single_difficult')}
          {formField('chart_single_expert')}
          {formField('chart_single_challenge')}
        </Column>
        <Column>
          {formField('chart_double_beginner')}
          {formField('chart_double_easy')}
          {formField('chart_double_difficult')}
          {formField('chart_double_expert')}
          {formField('chart_double_challenge')}
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
  const {
    title,
    artist,
    release,
    length,
    bpmDisplay,
    charts
  } = detail
  const history = useHistory()
  const [updating, setUpdating] = useState(false)

  const handleSelectEdit = () => {
    setUpdating(true)
  }

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

  const Content = () => Object.keys(detail)
    .filter(key => !['_id', '__v'].includes(key))
    .filter(key => !['charts', 'stops', 'bpm'].includes(key))
    .map(key => <h1 key={key}>{key}: {detail[key]}</h1>)

  const handleBack = () => history.goBack()

  return (
    <>
      <h1>{path} detail!</h1>
      <Button onClick={handleSelectEdit}>Edit</Button>
      <Button onClick={handleBack}>Go back!!</Button>
      {updating
        ? <SongForm
          targetId={id}
          setSubmitting={setUpdating}
        />
        : <Content />}
    </>
  )
}

export default Song
