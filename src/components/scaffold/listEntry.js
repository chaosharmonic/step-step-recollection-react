import React from 'react'
import { Container } from 'rbx'

export const ListEntry = ({ children }) => (
  <Container className='listEntry'>
    <Container>
      {children}
    </Container>
  </Container>
)
