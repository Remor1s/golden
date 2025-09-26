import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import AdminPanel from './components/AdminPanel.jsx'
import './styles.css'

function Router() {
  const [route, setRoute] = useState(() => (location.hash || '#/').replace('#', ''))
  useEffect(() => {
    const onHash = () => setRoute((location.hash || '#/').replace('#', ''))
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  if (route.startsWith('/admin')) return <AdminPanel />
  return <App />
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
)


