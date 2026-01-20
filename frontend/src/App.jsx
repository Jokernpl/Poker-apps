import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import LobbyPage from './pages/LobbyPage'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('accessToken')

  useEffect(() => {
    if (token) {
      fetch('http://localhost:3001/api/user/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.ok && r.json()).then(u => setUser(u)).finally(() => setLoading(false))
    } else setLoading(false)
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={(u,t) => {localStorage.setItem('accessToken',t); setUser(u)}} />} />
        {user ? (
          <Route path="/lobby" element={<LobbyPage user={user} />} />
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </BrowserRouter>
  )
}
export default App