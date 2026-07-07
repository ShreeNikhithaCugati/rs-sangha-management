'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SuperAdminSidebar from '@/components/SuperAdminSidebar'

interface Sangha {
  id: string
  sanghaId: string
  name: string
  isActive: boolean
  createdAt: string
  membersCount: number
  admin: {
    id: string
    name: string
    email: string
  } | null
}

export default function SuperAdminDashboard() {
  const [sanghas, setSanghas] = useState<Sangha[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateSangha, setShowCreateSangha] = useState(false)
  const [showCreateAdmin, setShowCreateAdmin] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [generatedSanghaId, setGeneratedSanghaId] = useState('')
  const router = useRouter()

  const [sanghaForm, setSanghaForm] = useState({
    name: '',
    address: '',
    date: '',
    time: '',
    sanghaId: '',
  })

  const [adminForm, setAdminForm] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    phone: '',
    sanghaId: '',
  })

  const generateSanghaId = () => {
    const count = sanghas.length + 1
    const prefix = 'RSB'
    const number = String(count).padStart(3, '0')
    return `${prefix}${number}`
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    console.log('🔍 Token from localStorage:', token ? 'Yes' : 'No')
    
    if (!token) {
      router.push('/login')
      return
    }
    fetchAllData()
  }, [])

  useEffect(() => {
    if (showCreateSangha) {
      setGeneratedSanghaId(generateSanghaId())
      const now = new Date()
      const dateStr = now.toISOString().split('T')[0]
      const timeStr = now.toTimeString().slice(0, 5)
      setSanghaForm(prev => ({ ...prev, date: dateStr, time: timeStr }))
    }
  }, [showCreateSangha, sanghas.length])

  const fetchAllData = async () => {
  try {
    const token = localStorage.getItem('token')
    
    if (!token) {
      console.log('❌ No token found')
      router.push('/login')
      return
    }
    
    const sanghasRes = await fetch('/api/superadmin/sanghas', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    const result = await sanghasRes.json()
    console.log('📊 API Response:', result)
    
    // ✅ FIX: Check if response is successful and data exists
    if (!sanghasRes.ok) {
      throw new Error(result.error || 'Failed to fetch sanghas')
    }
    
    // ✅ FIX: Get data from result.data (not result directly)
    const sanghasData = result.data || []
    
    // ✅ FIX: Check if it's an array before sorting
    if (!Array.isArray(sanghasData)) {
      console.warn('⚠️ Data is not an array:', sanghasData)
      setSanghas([])
      return
    }
    
    // ✅ Now safely sort
    const sortedSanghas = sanghasData.sort((a: Sangha, b: Sangha) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    setSanghas(sortedSanghas)
    
  } catch (error) {
    console.error('❌ Error fetching data:', error)
    setSanghas([]) // Set empty array on error
  } finally {
    setLoading(false)
  }
}

  const handleCreateSangha = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      
      const formData = {
        ...sanghaForm,
        sanghaId: generatedSanghaId,
      }

      const response = await fetch('/api/superadmin/sanghas', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create Sangha')
      }

      setMessage(`✅ Sangha "${data.sangha.name}" created successfully! ID: ${data.sangha.sanghaId}`)
      setSanghaForm({ name: '', address: '', date: '', time: '', sanghaId: '' })
      setShowCreateSangha(false)
      fetchAllData()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch('/api/superadmin/create-admin', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(adminForm),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create Admin')
      }

      setMessage(`✅ Admin "${data.admin.name}" created successfully! Password: ${data.tempPassword}`)
      setAdminForm({ username: '', name: '', email: '', password: '', phone: '', sanghaId: '' })
      setShowCreateAdmin(false)
      fetchAllData()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const handleViewSanghas = () => {
    router.push('/dashboard/superadmin/sanghas')
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e1b4b, #4c1d95, #9d174d)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ color: 'white', fontSize: '20px' }}>Loading...</div>
      </div>
    )
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
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: 'white',
              margin: 0
            }}>
              👑 Super Admin Dashboard
            </h1>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                color: '#fca5a5',
                padding: '10px 24px',
                borderRadius: '10px',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'
              }}
            >
              🚪 Logout
            </button>
          </div>

          {message && (
            <div style={{
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(74, 222, 128, 0.3)',
              color: '#86efac',
              padding: '14px 18px',
              borderRadius: '10px',
              marginBottom: '20px'
            }}>
              {message}
            </div>
          )}
          {error && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(248, 113, 113, 0.3)',
              color: '#fca5a5',
              padding: '14px 18px',
              borderRadius: '10px',
              marginBottom: '20px'
            }}>
              {error}
            </div>
          )}

          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(10px)',
              borderRadius: '14px',
              padding: '24px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <p style={{ color: '#a5b4fc', fontSize: '14px', margin: 0, marginBottom: '6px' }}>Total Sanghas</p>
              <p style={{ color: 'white', fontSize: '36px', fontWeight: '700', margin: 0 }}>{sanghas.length}</p>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(10px)',
              borderRadius: '14px',
              padding: '24px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <p style={{ color: '#a5b4fc', fontSize: '14px', margin: 0, marginBottom: '6px' }}>Total Admins</p>
              <p style={{ color: 'white', fontSize: '36px', fontWeight: '700', margin: 0 }}>
                {sanghas.filter(s => s.admin).length}
              </p>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(10px)',
              borderRadius: '14px',
              padding: '24px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <p style={{ color: '#a5b4fc', fontSize: '14px', margin: 0, marginBottom: '6px' }}>Total Members</p>
              <p style={{ color: 'white', fontSize: '36px', fontWeight: '700', margin: 0 }}>
                {sanghas.reduce((acc, s) => acc + s.membersCount, 0)}
              </p>
            </div>
          </div>

          

          {/* Create Sangha Form */}
          {showCreateSangha && (
            <div style={{
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(10px)',
              borderRadius: '14px',
              padding: '28px',
              border: '1px solid rgba(255,255,255,0.1)',
              marginBottom: '24px'
            }}>
              <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '600', margin: '0 0 20px 0' }}>
                Create New Sangha
              </h2>
              <form onSubmit={handleCreateSangha}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                }}>
                  <div>
                    <label style={{ display: 'block', color: '#a5b4fc', fontSize: '13px', marginBottom: '4px' }}>
                      Sangha ID (Auto-generated)
                    </label>
                    <input
                      type="text"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '10px',
                        color: '#818cf8',
                        fontSize: '15px',
                        fontWeight: '600',
                        outline: 'none',
                        boxSizing: 'border-box',
                        cursor: 'not-allowed',
                      }}
                      value={generatedSanghaId}
                      readOnly
                    />
                    <p style={{ color: '#a5b4fc', fontSize: '12px', marginTop: '4px' }}>
                      Auto-generated based on next available number
                    </p>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#a5b4fc', fontSize: '13px', marginBottom: '4px' }}>
                      Sangha Name *
                    </label>
                    <input
                      type="text"
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
                        boxSizing: 'border-box',
                        transition: 'all 0.3s ease',
                      }}
                      placeholder="Enter sangha name"
                      value={sanghaForm.name}
                      onChange={(e) => {
                        setSanghaForm({ ...sanghaForm, name: e.target.value })
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#a5b4fc', fontSize: '13px', marginBottom: '4px' }}>
                      Address *
                    </label>
                    <input
                      type="text"
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
                        boxSizing: 'border-box',
                        transition: 'all 0.3s ease',
                      }}
                      placeholder="Enter sangha address"
                      value={sanghaForm.address}
                      onChange={(e) => setSanghaForm({ ...sanghaForm, address: e.target.value })}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#a5b4fc', fontSize: '13px', marginBottom: '4px' }}>
                      Date *
                    </label>
                    <input
                      type="date"
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
                        boxSizing: 'border-box',
                        transition: 'all 0.3s ease',
                      }}
                      value={sanghaForm.date}
                      onChange={(e) => setSanghaForm({ ...sanghaForm, date: e.target.value })}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#a5b4fc', fontSize: '13px', marginBottom: '4px' }}>
                      Time *
                    </label>
                    <input
                      type="time"
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
                        boxSizing: 'border-box',
                        transition: 'all 0.3s ease',
                      }}
                      value={sanghaForm.time}
                      onChange={(e) => setSanghaForm({ ...sanghaForm, time: e.target.value })}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
                    />
                  </div>
                </div>
                <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      backgroundColor: '#6366f1',
                      color: 'white',
                      padding: '12px 28px',
                      borderRadius: '10px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '15px',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#4f46e5'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#6366f1'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    {loading ? 'Creating...' : 'Create Sangha'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateSangha(false)}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      padding: '12px 28px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      cursor: 'pointer',
                      fontSize: '15px',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Create Admin Form */}
          {showCreateAdmin && (
            <div style={{
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(10px)',
              borderRadius: '14px',
              padding: '28px',
              border: '1px solid rgba(255,255,255,0.1)',
              marginBottom: '24px'
            }}>
              <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '600', margin: '0 0 20px 0' }}>
                Create Admin
              </h2>
              <form onSubmit={handleCreateAdmin}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                }}>
                  <div>
                    <label style={{ display: 'block', color: '#a5b4fc', fontSize: '13px', marginBottom: '4px' }}>
                      Username *
                    </label>
                    <input
                      type="text"
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
                        boxSizing: 'border-box',
                        transition: 'all 0.3s ease',
                      }}
                      placeholder="admin_username"
                      value={adminForm.username}
                      onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#22c55e'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#a5b4fc', fontSize: '13px', marginBottom: '4px' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
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
                        boxSizing: 'border-box',
                        transition: 'all 0.3s ease',
                      }}
                      placeholder="Admin Name"
                      value={adminForm.name}
                      onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#22c55e'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#a5b4fc', fontSize: '13px', marginBottom: '4px' }}>
                      Email *
                    </label>
                    <input
                      type="email"
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
                        boxSizing: 'border-box',
                        transition: 'all 0.3s ease',
                      }}
                      placeholder="admin@example.com"
                      value={adminForm.email}
                      onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#22c55e'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#a5b4fc', fontSize: '13px', marginBottom: '4px' }}>
                      Password *
                    </label>
                    <input
                      type="text"
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
                        boxSizing: 'border-box',
                        transition: 'all 0.3s ease',
                      }}
                      placeholder="Min 6 characters"
                      value={adminForm.password}
                      onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#22c55e'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#a5b4fc', fontSize: '13px', marginBottom: '4px' }}>
                      Phone
                    </label>
                    <input
                      type="tel"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '10px',
                        color: 'white',
                        fontSize: '15px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'all 0.3s ease',
                      }}
                      placeholder="Phone number"
                      value={adminForm.phone}
                      onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#22c55e'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#a5b4fc', fontSize: '13px', marginBottom: '4px' }}>
                      Assign to Sangha *
                    </label>
                    <select
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
                        boxSizing: 'border-box',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                      }}
                      value={adminForm.sanghaId}
                      onChange={(e) => setAdminForm({ ...adminForm, sanghaId: e.target.value })}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#22c55e'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
                    >
                      <option value="" style={{ color: '#1e1b4b' }}>Select a Sangha</option>
                      {sanghas.map((sangha) => (
                        <option key={sangha.id} value={sangha.id} style={{ color: '#1e1b4b' }}>
                          {sangha.name} ({sangha.sanghaId})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      backgroundColor: '#22c55e',
                      color: 'white',
                      padding: '12px 28px',
                      borderRadius: '10px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '15px',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#16a34a'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#22c55e'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    {loading ? 'Creating...' : 'Create Admin'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateAdmin(false)}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      padding: '12px 28px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      cursor: 'pointer',
                      fontSize: '15px',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}