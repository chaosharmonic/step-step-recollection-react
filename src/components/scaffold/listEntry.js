import React from 'react'
import { Container } from 'rbx'

export const ListEntry = ({ children }) => (
  <Container className='listEntry'>
    <Container className='listContainer'>
      {children}
    </Container>
  </Container>
)
