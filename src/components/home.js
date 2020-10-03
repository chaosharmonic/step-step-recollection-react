import React from 'react'
import { Container, Title, Content } from 'rbx'

export const Home = () => (
  <Container className='transition'>
    <Title>Step Step Recollection!</Title>
    <Content size='small'>
      <p>
          Step Step Recollection is a workout tracker for rhythm games, built as a plague project/cardio log.
      </p>
      <p>How to use:</p>
      <ul>
        <li>
            Sign in using a provided login, or the demo credentials on the login page
        </li>
        <li>
            Navigate to the songs menu to browse all songs,
            or to the releases menu to navigate songs by the game in which they appear.
        </li>
        <li>
            To add a song to your gameplay session, select "add to session,"
            then choose from the options displayed
        </li>
        <li>
            Navigate to the session menu to update or save your current session.
            You can also view existing sessions here, as well as edit or delete yours.
        </li>
      </ul>
      <p>
          This site was built using React, Express, and MongoDB.
          It's still under active development, so don't hesitate to check back and see what's new.
      </p>
      <p>
          You can also check out updates as they happen, for this and other projects,
          on my <a href='https://github.com/chaosharmonic'>Github</a>.
      </p>
      <p>Let's DDR!</p>
    </Content>
  </Container>
)
