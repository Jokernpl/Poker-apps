import React, { useState, useEffect } from 'react'

export default function LobbyPage({ user }) {
  const [tables, setTables] = useState([])

  useEffect(() => {
    fetch('http://localhost:3001/api/game/tables', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
    }).then(r => r.json()).then(setTables)
  }, [])

  return (
    <div style={{padding:'20px'}}>
      <h1>♠️ Welcome {user.username}</h1>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))',gap:'20px'}}>
        {tables.map(t => (
          <div key={t.id} style={{background:'#2a2a2a',border:'2px solid #4CAF50',borderRadius:'8px',padding:'20px'}}>
            <h3 style={{color:'#4CAF50'}}>{t.name}</h3>
            <p>💰 ${t.smallBlind}/${t.bigBlind}</p>
            <button style={{width:'100%',padding:'10px',background:'#4CAF50',color:'#fff',border:'none',cursor:'pointer',borderRadius:'5px'}}>Join</button>
          </div>
        ))}
      </div>
    </div>
  )
}