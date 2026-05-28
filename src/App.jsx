import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import { I18n } from 'aws-amplify/utils'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

I18n.putVocabularies({
  pl: {
    'Sign In': 'Zaloguj się',
    'Sign in': 'Zaloguj się',
    'Sign in to your account': 'Zaloguj się do MindData',
    'Password': 'Hasło',
    'Enter your Password': 'Wpisz hasło',
    'Forgot your password?': 'Nie pamiętasz hasła?',
    'Reset Password': 'Resetuj hasło',
    'Send code': 'Wyślij kod',
    'Submit': 'Zatwierdź',
    'Confirm': 'Potwierdź',
    'Confirmation Code': 'Kod potwierdzający',
    'New password': 'Nowe hasło',
    'New Password': 'Nowe hasło',
    'Confirm Password': 'Potwierdź hasło',
    'Change Password': 'Zmień hasło',
    'Back to Sign In': 'Wróć do logowania',
    'Resend Code': 'Wyślij kod ponownie',
    'Code': 'Kod',
    'Incorrect username or password.': 'Nieprawidłowy email lub hasło.',
    'User does not exist.': 'Użytkownik nie istnieje.',
    'Password attempts exceeded': 'Zbyt wiele prób logowania — spróbuj za chwilę.',
    'An account with the given email already exists.': 'Konto z tym adresem email już istnieje.',
    'Invalid verification code provided, please try again.': 'Nieprawidłowy kod weryfikacyjny.',
    'Your passwords must match': 'Hasła muszą być identyczne.',
    'Password must have at least 8 characters': 'Hasło musi mieć co najmniej 8 znaków.',
    'Username': 'Email',
    'Enter your Username': 'Wpisz email',
    'Email': 'Email',
    'Enter your Email': 'Wpisz email',
    'Create Account': 'Zarejestruj się',
    'Create a new account': 'Zarejestruj się',
    'Creating Account': 'Tworzę konto…',
    'Have an account? ': 'Masz już konto? ',
    'No account? ': 'Nie masz konta? ',
    'Or': 'lub',
  },
})
I18n.setLanguage('pl')
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
