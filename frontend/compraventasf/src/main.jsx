import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './marketplace/App.jsx'
import { PreferencesProvider } from './context/PreferencesContext.jsx'
import { UserProvider } from './context/UserContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <PreferencesProvider>
        <UserProvider>
          <App />
        </UserProvider>
      </PreferencesProvider>
    </BrowserRouter>
  </StrictMode>,
)