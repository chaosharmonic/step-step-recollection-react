import React from 'react'
import { Pagination } from 'rbx'
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io'

export const Paginate = ({ getPage, entries, currentPage, pageCount }) => {
  if (entries.length === 0) return null
  const pageNumbers = [
    1,
    currentPage - 1,
    currentPage,
    currentPage + 1,
    pageCount
  ].sort((a, b) => a - b)
    .filter((num, index, arr) => num > 0 &&
        num !== arr[index - 1] &&
        num <= pageCount)
    .map((num, index, arr) => {
      const handleGetPage = () => getPage(num)
      return (
        <>
          {(!(arr[index - 1] === num - 1) &&
            num !== pageCount &&
            num !== 1) && <Pagination.Ellipsis />}
          <Pagination.Link
            current={num === currentPage}
            onClick={handleGetPage}
          >
            {num}
          </Pagination.Link>
          {(!(arr[index + 1] === num + 1) &&
              num !== pageCount &&
              num !== 1) && <Pagination.Ellipsis />}
        </>
      )
    })

  const getLastOne = () => getPage(currentPage - 1)
  const getNextOne = () => getPage(currentPage + 1)
  return (
    <Pagination align='centered'>
      <Pagination.List>
        {pageNumbers}
      </Pagination.List>
      {currentPage !== 1 &&
        <Pagination.Step
          align='previous'
          onClick={getLastOne}
        >
          <IoIosArrowBack />
        </Pagination.Step>}
      {currentPage !== pageCount &&
        <Pagination.Step
          align='next'
          onClick={getNextOne}
        >
          <IoIosArrowForward />
        </Pagination.Step>}
    </Pagination>
  )
}
// TODO: handle edge cases
//  larger page skip interval for long entries
//  manual page selection
