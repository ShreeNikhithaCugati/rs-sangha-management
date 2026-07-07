'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SuperAdminSidebar from '@/components/SuperAdminSidebar'

interface Sangha {
  id: string
  sanghaId: string
  name: string
  code: string
  isActive: boolean
  createdAt: string
  membersCount: number
  address: string | null
  admin: {
    id: string
    name: string
    email: string
  } | null
}

export default function SanghasPage() {
  const [sanghas, setSanghas] = useState<Sangha[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))
    if (!token) {
      router.push('/login')
      return
    }
    fetchSanghas()
  }, [])

  const fetchSanghas = async () => {
    try {
      const response = await fetch('/api/superadmin/sanghas')
      const data = await response.json()
      const sortedData = data.sort((a: Sangha, b: Sangha) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      setSanghas(sortedData)
    } catch (error) {
      console.error('Error fetching sanghas:', error)
    } finally {
      setLoading(false)
    }
  }

  // ✅ DELETE FUNCTION - Only if no admin assigned
  const handleDeleteSangha = async (sanghaId: string, hasAdmin: boolean) => {
    if (hasAdmin) {
      alert('❌ Cannot delete Sangha with an assigned Admin. Please unassign the admin first.')
      return
    }

    if (!confirm('⚠️ Are you sure you want to delete this Sangha? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/superadmin/sanghas/${sanghaId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        alert('✅ Sangha deleted successfully!')
        fetchSanghas()
      } else {
        alert('❌ ' + data.error)
      }
    } catch (error) {
      console.error('Error deleting sangha:', error)
      alert('❌ Error deleting sangha')
    }
  }

  const handleRowClick = (sangha: Sangha) => {
    if (sangha.admin) {
      router.push(`/dashboard/superadmin/view-sangha/${sangha.id}`)
    }
  }

  const filteredSanghas = sanghas.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.sanghaId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: '700', color: 'white', margin: 0 }}>
                🏛️ Sanghas
              </h1>
              <p style={{ color: '#a5b4fc', fontSize: '14px', marginTop: '4px' }}>
                Manage all Sanghas • {sanghas.length} total
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{ marginBottom: '24px' }}>
            <input
              type="text"
              placeholder="🔍 Search Sanghas by name, ID, or code..."
              style={{
                width: '100%',
                padding: '14px 18px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'all 0.3s ease',
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={(e) => e.currentTarget.style.borderColor = '#6366f1'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
            />
          </div>

          {/* Sanghas Table */}
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(10px)',
            borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h2 style={{ color: 'white', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                🏛️ Sanghas List
              </h2>
              <span style={{ color: '#a5b4fc', fontSize: '14px' }}>
                {filteredSanghas.length} found
              </span>
            </div>
            {filteredSanghas.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#a5b4fc' }}>
                No sanghas found.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  color: 'white',
                }}>
                  <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <tr>
                      <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '12px', color: '#a5b4fc', fontWeight: '500' }}>Sangha ID</th>
                      <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '12px', color: '#a5b4fc', fontWeight: '500' }}>Name</th>
                      <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '12px', color: '#a5b4fc', fontWeight: '500' }}>Address</th>
                      <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '12px', color: '#a5b4fc', fontWeight: '500' }}>Admin</th>
                      <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '12px', color: '#a5b4fc', fontWeight: '500' }}>Members</th>
                      <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '12px', color: '#a5b4fc', fontWeight: '500' }}>Status</th>
                      <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '12px', color: '#a5b4fc', fontWeight: '500' }}>Created</th>
                      <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '12px', color: '#a5b4fc', fontWeight: '500' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSanghas.map((sangha) => (
                      <tr 
                        key={sangha.id} 
                        style={{ 
                          borderTop: '1px solid rgba(255,255,255,0.05)',
                          cursor: sangha.admin ? 'pointer' : 'default'
                        }}
                        onClick={() => handleRowClick(sangha)}
                        onMouseEnter={(e) => {
                          if (sangha.admin) {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent'
                        }}
                      >
                        <td style={{ padding: '14px 18px', color: '#818cf8', fontWeight: '600' }}>{sangha.sanghaId}</td>
                        <td style={{ padding: '14px 18px' }}>{sangha.name}</td>
                        <td style={{ padding: '14px 18px', color: '#a5b4fc' }}>{sangha.address || 'N/A'}</td>
                        <td style={{ padding: '14px 18px', color: '#a5b4fc' }}>
                          {sangha.admin ? sangha.admin.name : 'No admin assigned'}
                        </td>
                        <td style={{ padding: '14px 18px', color: '#a5b4fc' }}>{sangha.membersCount}</td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{
                            background: sangha.isActive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            color: sangha.isActive ? '#86efac' : '#fca5a5',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                          }}>
                            {sangha.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px', color: '#a5b4fc' }}>
                          <div>{new Date(sangha.createdAt).toLocaleDateString()}</div>
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>
                            {new Date(sangha.createdAt).toLocaleTimeString()}
                          </div>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          {/* ✅ DELETE BUTTON - Only if NO admin */}
                          {!sangha.admin ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteSangha(sangha.id, false)
                              }}
                              style={{
                                background: 'rgba(239, 68, 68, 0.2)',
                                color: '#fca5a5',
                                padding: '6px 14px',
                                borderRadius: '6px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '13px',
                                transition: 'all 0.3s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.4)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
                              }}
                            >
                              🗑️ Delete
                            </button>
                          ) : (
                            <span style={{ 
                              color: '#6b7280', 
                              fontSize: '12px',
                              background: 'rgba(107, 114, 128, 0.1)',
                              padding: '4px 10px',
                              borderRadius: '4px'
                            }}>
                              Has Admin
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}