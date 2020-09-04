import React, { useContext } from 'react'

import { BrowserRouter, Route, Link } from 'react-router-dom'
import { Section } from 'rbx'
import 'bulmaswatch/cyborg/bulmaswatch.min.css'

import { LoginForm, LogoutButton } from './components/auth'
import { Release, ReleaseDetail } from './components/release'
import { Song, SongDetail } from './components/song'
import { Session, SessionDetail } from './components/session'
import { AuthProvider, AuthContext } from './contexts/auth'
import { ReleaseProvider } from './contexts/release'
import { SongProvider } from './contexts/song'
import { SessionProvider } from './contexts/session'

const Home = () => (
  <>
    <h1>Step Step Recollection!</h1>
  </>
)

const NavHeader = () => {
  const { user = {} } = useContext(AuthContext)
  const { username = null } = user
  return (
    <>
      <Link to='/release/'>Release</Link>
      <Link to='/song/'>Song</Link>
      <Link to='/session/'>Session</Link>
      {username
        ? <LogoutButton />
        : <Link to='/login/'>Login</Link>}
    </>
  )
}

function App () {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Section>
          <NavHeader />
          <Route exact path='/' component={Home} />
          <SessionProvider>
            <Route path='/login' component={LoginForm} />
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
        </Section>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
