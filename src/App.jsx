import React, { useContext } from 'react'
import { BrowserRouter, Switch, Route, Link } from 'react-router-dom'
import { Section, Container, Navbar } from 'rbx'
import './App.css'
import 'bulmaswatch/cyborg/bulmaswatch.min.css'

import { Home } from './components/home'
import { LoginForm, LogoutButton } from './components/auth'
import { Album, AlbumDetail } from './components/album'
import { Song, SongDetail } from './components/song'
import { Setlist, SetlistDetail } from './components/setlist'
import { AuthProvider, AuthContext } from './contexts/auth'
import { AlbumProvider } from './contexts/album'
import { SongProvider } from './contexts/song'
import { SetlistProvider } from './contexts/setlist'

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
          <Link to='/album/'>Album</Link>
        </Navbar.Item>
        <Navbar.Item as='div'>
          <Link to='/song/'>Song</Link>
        </Navbar.Item>
        <Navbar.Item as='div'>
          <Link to='/setlist/'>Setlist</Link>
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
          <Container id='main'>
            <Switch>
              <Route exact path='/' component={Home} />
              <Route path='/login' component={LoginForm} />
              <SetlistProvider>
                <AlbumProvider>
                  <Route path='/album/:id' component={AlbumDetail} />
                  <Route path='/album/' component={Album} />
                </AlbumProvider>
                <SongProvider>
                  <Route path='/song/:id' component={SongDetail} />
                  <Route path='/song/' component={Song} />
                </SongProvider>
                <Route path='/setlist/:id' component={SetlistDetail} />
                <Route path='/setlist/' component={Setlist} />
              </SetlistProvider>
            </Switch>
          </Container>
        </Section>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
