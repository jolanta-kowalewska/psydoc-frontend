import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainApp from './components/MainApp'
import ClientList from './components/ClientList'
import ClientDetail from './components/ClientDetail'
import ClientForm from './components/ClientForm'

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <BrowserRouter>
          <MainApp user={user} signOut={signOut}>
            <Routes>
              <Route path="/" element={<Navigate to="/clients" replace />} />
              <Route path="/clients" element={<ClientList />} />
              <Route path="/clients/new" element={<ClientForm />} />
              <Route path="/clients/:clientId" element={<ClientDetail />} />
            </Routes>
          </MainApp>
        </BrowserRouter>
      )}
    </Authenticator>
  )
}

export default App
