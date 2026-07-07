// app/login/page.tsx
'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('MEMBER')
  const [sanghaId, setSanghaId] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const roles = [
    { value: 'SUPERADMIN', label: 'Super Admin' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'MEMBER', label: 'Member' }
  ]

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setError('')
  setSuccessMessage('')

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // ✅ IMPORTANT: Include cookies
      body: JSON.stringify({ identifier, password, role, sanghaId }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Login failed')
    }

    // ✅ Save token to localStorage
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))

    // ✅ Also set the token in a header for future requests
    // This is done automatically when you use 'credentials: include'

    setSuccessMessage(`✅ Welcome back, ${data.user.name || data.user.email}! Redirecting...`)

    const userRole = data.user.role.toLowerCase()
    
    setTimeout(() => {
      window.location.href = `/dashboard/${userRole}`
    }, 1500)
    
  } catch (err) {
    setError((err as Error).message)
    setLoading(false)
  }
}

  return (
    // ... rest of your JSX remains the same
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e1b4b, #4c1d95, #9d174d)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
    }}>
      <div style={{
        maxWidth: '420px',
        width: '100%',
        padding: '40px 36px',
        background: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.15)',
        boxShadow: '0 30px 60px -20px rgba(0,0,0,0.6)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: 'white',
            marginBottom: '6px',
            letterSpacing: '-0.5px',
          }}>
            RS Associates
          </h2>
          <p style={{
            fontSize: '15px',
            color: '#a5b4fc',
            fontWeight: '400',
          }}>
            Sign in to your account
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* ... rest of your form stays the same */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: '#c7d2fe',
                marginBottom: '5px',
                letterSpacing: '0.3px',
              }}>
                Username or Email
              </label>
              <input
                type="text"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'white',
                  borderRadius: '10px',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                }}
                placeholder="Enter username or email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#818cf8'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: '#c7d2fe',
                marginBottom: '5px',
                letterSpacing: '0.3px',
              }}>
                Password
              </label>
              <input
                type="password"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'white',
                  borderRadius: '10px',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                }}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#818cf8'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: '#c7d2fe',
                marginBottom: '5px',
                letterSpacing: '0.3px',
              }}>
                Role
              </label>
              <select
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'white',
                  borderRadius: '10px',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                }}
                value={role}
                onChange={(e) => setRole(e.target.value)}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#818cf8'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                }}
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value} style={{ color: '#1e1b4b' }}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {role === 'ADMIN' && (
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#c7d2fe',
                  marginBottom: '5px',
                  letterSpacing: '0.3px',
                }}>
                  Sangha ID <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.06)',
                    color: 'white',
                    borderRadius: '10px',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box',
                  }}
                  placeholder="Enter your Sangha ID (e.g., RSB001)"
                  value={sanghaId}
                  onChange={(e) => setSanghaId(e.target.value.toUpperCase())}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#818cf8'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                  }}
                />
                <p style={{
                  fontSize: '11px',
                  color: '#a5b4fc',
                  marginTop: '4px',
                }}>
                  Enter the Sangha ID sent to your email after approval
                </p>
              </div>
            )}
          </div>

          {successMessage && (
            <div style={{
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(74, 222, 128, 0.3)',
              color: '#86efac',
              padding: '12px 16px',
              borderRadius: '10px',
              fontSize: '14px',
              marginTop: '18px',
              textAlign: 'center',
            }}>
              {successMessage}
            </div>
          )}

          {error && (
            <div style={{
              color: '#f87171',
              fontSize: '14px',
              textAlign: 'center',
              marginTop: '18px',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: 'white',
              color: '#1e1b4b',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              marginTop: '24px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e0e7ff'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)'
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <div style={{
            textAlign: 'center',
            marginTop: '18px',
          }}>
            <a href="/signup" style={{
              color: '#a5b4fc',
              fontSize: '14px',
              textDecoration: 'none',
              transition: 'color 0.3s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#a5b4fc'}
            >
              Don't have an account? Sign up
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}