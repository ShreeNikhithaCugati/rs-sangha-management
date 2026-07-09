'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SuperAdminSidebar from '@/components/SuperAdminSidebar'

interface Sangha {
  id: string
  sanghaId: string
  name: string
  address: string
}

export default function CreateAdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [sanghas, setSanghas] = useState<Sangha[]>([])
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    sanghaId: '',
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchSanghas()
  }, [])

  const fetchSanghas = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/superadmin/sanghas', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch sanghas')
      }

      const sanghasData = result.data || []
      // Filter only sanghas without admin
      const availableSanghas = sanghasData.filter((s: any) => !s.admin)
      setSanghas(availableSanghas)
    } catch (err: any) {
      console.error('Error fetching sanghas:', err)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    // Validate sangha selected
    if (!formData.sanghaId) {
      setError('Please select a Sangha')
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/superadmin/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: formData.username,
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || '',
          sanghaId: formData.sanghaId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create admin')
      }

      setSuccess(`✅ Admin created successfully! Temporary password: ${data.tempPassword}`)
      
      // Reset form
      setFormData({
        username: '',
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        sanghaId: '',
      })

      // Refresh sangha list
      fetchSanghas()

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e1b4b, #4c1d95, #9d174d)',
      display: 'flex',
      fontFamily: 'Arial, sans-serif'
    }}>
      <SuperAdminSidebar />

      <div style={{ flex: 1, padding: '32px 24px', overflowX: 'hidden' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h1 style={{ color: 'white', fontSize: '28px', fontWeight: '700', margin: 0 }}>
                👤 Create Admin
              </h1>
              <p style={{ color: '#a5b4fc', fontSize: '14px', marginTop: '4px' }}>
                Assign an admin to a Sangha
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard/superadmin')}
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            >
              ← Back to Dashboard
            </button>
          </div>

          {success && (
            <div style={{
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(74, 222, 128, 0.3)',
              color: '#86efac',
              padding: '16px 20px',
              borderRadius: '10px',
              marginBottom: '20px'
            }}>
              {success}
            </div>
          )}

          {error && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(248, 113, 113, 0.3)',
              color: '#fca5a5',
              padding: '16px 20px',
              borderRadius: '10px',
              marginBottom: '20px'
            }}>
              ❌ {error}
            </div>
          )}

          <div style={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            borderRadius: '16px',
            padding: '32px',
            border: '1px solid rgba(255,255,255,0.15)'
          }}>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Username */}
                <div>
                  <label style={{ color: '#c7d2fe', fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                    Username *
                  </label>
                  <input
                    type="text"
                    name="username"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Enter unique username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>

                {/* Full Name */}
                <div>
                  <label style={{ color: '#c7d2fe', fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                {/* Email */}
                <div>
                  <label style={{ color: '#c7d2fe', fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label style={{ color: '#c7d2fe', fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Enter phone number (optional)"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                {/* Password */}
                <div>
                  <label style={{ color: '#c7d2fe', fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label style={{ color: '#c7d2fe', fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p style={{ fontSize: '12px', color: '#f87171', marginTop: '4px' }}>❌ Passwords do not match</p>
                  )}
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <p style={{ fontSize: '12px', color: '#86efac', marginTop: '4px' }}>✅ Passwords match</p>
                  )}
                </div>

                {/* Select Sangha */}
                <div>
                  <label style={{ color: '#c7d2fe', fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                    Assign to Sangha *
                  </label>
                  <select
                    name="sanghaId"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    value={formData.sanghaId}
                    onChange={handleChange}
                  >
                    <option value="" style={{ color: 'black' }}>Select a Sangha</option>
                    {sanghas.map((sangha) => (
                      <option key={sangha.id} value={sangha.id} style={{ color: 'black' }}>
                        {sangha.name} ({sangha.sanghaId})
                      </option>
                    ))}
                  </select>
                  {sanghas.length === 0 && (
                    <p style={{ fontSize: '12px', color: '#fbbf24', marginTop: '4px' }}>
                      No sanghas available without admin. Create a sangha first.
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || sanghas.length === 0}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: loading || sanghas.length === 0 ? 'not-allowed' : 'pointer',
                  marginTop: '24px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                  opacity: loading || sanghas.length === 0 ? 0.5 : 1
                }}
              >
                {loading ? 'Creating Admin...' : '👤 Create Admin'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}