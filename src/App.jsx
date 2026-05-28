import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainApp from './components/MainApp'
import ClientList from './components/ClientList'
import ClientDetail from './components/ClientDetail'
import ClientForm from './components/ClientForm'
import SessionDetail from './components/SessionDetail'
import PsychologistProfile from './components/PsychologistProfile'
import CalendarPage from './components/CalendarPage'
import GettingStarted from './components/GettingStarted'
import SecurityPage from './pages/SecurityPage'
import Dashboard from './pages/Dashboard'

function AuthenticatedShell() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <MainApp user={user} signOut={signOut}>
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="clients" element={<ClientList />} />
            <Route path="clients/new" element={<ClientForm />} />
            <Route path="clients/:clientId" element={<ClientDetail />} />
            <Route path="clients/:clientId/sessions/:sessionId" element={<SessionDetail />} />
            <Route path="profile" element={<PsychologistProfile />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="start" element={<GettingStarted />} />
          </Routes>
        </MainApp>
      )}
    </Authenticator>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/bezpieczenstwo" element={<SecurityPage />} />
        <Route path="/*" element={<AuthenticatedShell />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
