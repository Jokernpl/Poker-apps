import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    const res = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    if (res.ok) { onLogin(data.user, data.accessToken); navigate('/lobby') }
  }

  return (
    <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}}>
      <div style={{background:'#2a2a2a',padding:'40px',borderRadius:'10px',width:'90%',maxWidth:'400px'}}>
        <h1 style={{color:'#4CAF50',textAlign:'center'}}>♠️ LOGIN</h1>
        <form onSubmit={handleLogin} style={{display:'flex',flexDirection:'column',gap:'15px'}}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{padding:'12px',background:'#3a3a3a',color:'#fff',border:'1px solid #444',borderRadius:'5px'}} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{padding:'12px',background:'#3a3a3a',color:'#fff',border:'1px solid #444',borderRadius:'5px'}} />
          <button type="submit" style={{padding:'12px',background:'#4CAF50',color:'#fff',border:'none',borderRadius:'5px',cursor:'pointer'}}>Login</button>
        </form>
        <p style={{textAlign:'center',marginTop:'20px'}}><Link to="/login" style={{color:'#4CAF50'}}>Create Account</Link></p>
      </div>
    </div>
  )
}