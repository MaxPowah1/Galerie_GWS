import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const redirectPath = new URLSearchParams(window.location.search).get('p')
if (redirectPath) {
  const normalizedPath = redirectPath.startsWith('/') ? redirectPath : `/${redirectPath}`
  window.history.replaceState(null, '', normalizedPath)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
