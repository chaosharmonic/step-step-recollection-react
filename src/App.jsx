import React, { useContext } from 'react'

import { BrowserRouter, Route, Link } from 'react-router-dom'
import { Section, Container, Navbar } from 'rbx'
import 'bulmaswatch/cyborg/bulmaswatch.min.css'

import { Home } from './components/home'
import { LoginForm, LogoutButton } from './components/auth'
import { Release, ReleaseDetail } from './components/release'
import { Song, SongDetail } from './components/song'
import { Session, SessionDetail } from './components/session'
import { AuthProvider, AuthContext } from './contexts/auth'
import { ReleaseProvider } from './contexts/release'
import { SongProvider } from './contexts/song'
import { SessionProvider } from './contexts/session'

const Navigation = () => {
  const { user = {} } = useContext(AuthContext)
  const { username = null } = user
  return (
    <Navbar fixed='bottom'>
      <Navbar.Brand>
        <Navbar.Item as='div'>
          <Link to='/'>Home</Link>
        </Navbar.Item>
        <Navbar.Item as='div'>
          <Link to='/release/'>Release</Link>
        </Navbar.Item>
        <Navbar.Item as='div'>
          <Link to='/song/'>Song</Link>
        </Navbar.Item>
        <Navbar.Item as='div'>
          <Link to='/session/'>Session</Link>
        </Navbar.Item>
        <Navbar.Item as='div'>
          {username
            ? <LogoutButton />
            : <Link to='/login/'>Login</Link>}
        </Navbar.Item>
      </Navbar.Brand>
    </Navbar>
  )
}

function App () {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navigation />
        <Section>
          <Route exact path='/' component={Home} />
          <Route path='/login' component={LoginForm} />
          <Container>
            <SessionProvider>
              <ReleaseProvider>
                <Route path='/release/:id' component={ReleaseDetail} />
                <Route path='/release/' component={Release} />
              </ReleaseProvider>
              <SongProvider>
                <Route path='/song/:id' component={SongDetail} />
                <Route path='/song/' component={Song} />
              </SongProvider>
              <Route path='/session/:id' component={SessionDetail} />
              <Route path='/session/' component={Session} />
            </SessionProvider>
          </Container>
        </Section>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
