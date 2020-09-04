import React from 'react'
import { Field, Control, Label, Input, Select } from 'rbx'
// TODO:
//  Fix JSX output
//   Inserting into components as a function as a workaround for a separate issue
//   In which nesting these as JSX components causes events to remove focus from elements,
//    for... some reason?
//  Fix flagging from devTools about components switching between controlled, uncontrolled
//   It looks to have started when I recycled my create forms for updates
//   An HOC could possibly fix this...?

export const generateFormField = (field, label, state, handleSetFormValue, options = []) => {
  const value = state[field]

  const TextInput = () => (
    <Input
      type={field === 'password' ? 'password' : 'text'}
      placeholder={label}
      name={field}
      value={value}
      onChange={handleSetFormValue}
    />
  )
  const SelectInput = (props) => {
    const selectOptions = options.length > 0 &&
      options.map(option => {
        const {
          key = option,
          text = option
        } = option

        return (
          <Select.Option
            key={key}
            value={key}
          >
            {text}
          </Select.Option>
        )
      }
      )
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
      <Label>{label}</Label>
      <Control>
        {options.length > 0
          ? SelectInput()
          : TextInput()}
      </Control>
    </Field>
  )
}
