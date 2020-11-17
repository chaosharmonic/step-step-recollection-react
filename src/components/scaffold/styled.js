import React from 'react'
import { Button } from 'rbx'

export const BulmaButton = ({ onClick, children }) => (
  <Button outlined color='info' size='small' onClick={onClick}>{children}</Button>
)
