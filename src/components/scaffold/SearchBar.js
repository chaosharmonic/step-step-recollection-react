import React from 'react'
import { Container, Input } from 'rbx'
import { BulmaButton } from './styled'

export const SearchBar = ({ handleSearchInput, clearSearchInput, searchTerms, searchField }) => (
  <Container id='search'>
    <Input
      name='search'
      placeholder={`Search by ${searchField}`}
      onChange={handleSearchInput}
      value={searchTerms}
    />
    {searchTerms && (
      <label for='input'>
        <BulmaButton onClick={clearSearchInput}>Clear search</BulmaButton>
      </label>
    )}
  </Container>
)
