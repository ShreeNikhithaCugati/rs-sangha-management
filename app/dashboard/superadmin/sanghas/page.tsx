'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SuperAdminSidebar from '@/components/SuperAdminSidebar'

interface Sangha {
  id: string
  sanghaId: string
  name: string
  address: string
  date: string
  time: string
  isActive: boolean
  createdAt: string
  membersCount: number
  admin: {
    id: string
    name: string
    email: string
  } | null
}

export default function SanghasPage() {
  const [sanghas, setSanghas] = useState<Sangha[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

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
      setSanghas(sanghasData)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleSanghaStatus = async (sanghaId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/superadmin/sanghas/${sanghaId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to update sangha')
      }

      // Refresh the list
      fetchSanghas()
    } catch (err: any) {
      setError(err.message)
    }
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
        <div style={{ color: 'white', fontSize: '20px' }}>Loading sanghas...</div>
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
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
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
                🏛️ All Sanghas
              </h1>
              <p style={{ color: '#a5b4fc', fontSize: '14px', marginTop: '4px' }}>
                Manage all sanghas in the system
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
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
          </div>

          {error && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(248, 113, 113, 0.3)',
              color: '#fca5a5',
              padding: '14px 18px',
              borderRadius: '10px',
              marginBottom: '20px'
            }}>
              ❌ {error}
            </div>
          )}

          {sanghas.length === 0 ? (
            <div style={{
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(10px)',
              borderRadius: '14px',
              padding: '60px 40px',
              border: '1px solid rgba(255,255,255,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏛️</div>
              <p style={{ color: '#a5b4fc', fontSize: '18px' }}>No sanghas created yet.</p>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
                Sanghas will appear here once admins create them.
              </p>
              <button
                onClick={() => router.push('/dashboard/superadmin')}
                style={{
                  backgroundColor: '#6366f1',
                  color: 'white',
                  padding: '10px 24px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.3s ease'
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
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div style={{
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(10px)',
              borderRadius: '14px',
              border: '1px solid rgba(255,255,255,0.1)',
              overflow: 'hidden'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  color: 'white',
                  minWidth: '800px'
                }}>
                  <thead>
                    <tr style={{
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      backgroundColor: 'rgba(255,255,255,0.05)'
                    }}>
                      <th style={{ padding: '14px 16px', textAlign: 'left', color: '#a5b4fc', fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px' }}>
                        Sangha ID
                      </th>
                      <th style={{ padding: '14px 16px', textAlign: 'left', color: '#a5b4fc', fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px' }}>
                        Name
                      </th>
                      <th style={{ padding: '14px 16px', textAlign: 'left', color: '#a5b4fc', fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px' }}>
                        Address
                      </th>
                      <th style={{ padding: '14px 16px', textAlign: 'left', color: '#a5b4fc', fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px' }}>
                        Admin
                      </th>
                      <th style={{ padding: '14px 16px', textAlign: 'center', color: '#a5b4fc', fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px' }}>
                        Members
                      </th>
                      <th style={{ padding: '14px 16px', textAlign: 'center', color: '#a5b4fc', fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px' }}>
                        Status
                      </th>
                      <th style={{ padding: '14px 16px', textAlign: 'center', color: '#a5b4fc', fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px' }}>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sanghas.map((sangha, index) => (
                      <tr key={sangha.id} style={{
                        borderBottom: index < sanghas.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}>
                        <td style={{ padding: '14px 16px', fontSize: '14px' }}>
                          <span style={{
                            backgroundColor: 'rgba(99, 102, 241, 0.2)',
                            color: '#818cf8',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {sangha.sanghaId}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '500' }}>
                          {sangha.name}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '14px', color: '#a5b4fc' }}>
                          {sangha.address || 'N/A'}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '14px' }}>
                          {sangha.admin ? (
                            <div>
                              <div style={{ fontWeight: '500' }}>{sangha.admin.name}</div>
                              <div style={{ fontSize: '12px', color: '#a5b4fc' }}>{sangha.admin.email}</div>
                            </div>
                          ) : (
                            <span style={{ color: '#fbbf24', fontSize: '13px' }}>No admin assigned</span>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '14px', textAlign: 'center' }}>
                          <span style={{
                            backgroundColor: 'rgba(99, 102, 241, 0.15)',
                            color: '#818cf8',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '13px',
                            fontWeight: '600'
                          }}>
                            {sangha.membersCount || 0}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <span style={{
                            padding: '4px 14px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: sangha.isActive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            color: sangha.isActive ? '#4ade80' : '#f87171'
                          }}>
                            {sangha.isActive ? '🟢 Active' : '🔴 Blocked'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <button
                            onClick={() => toggleSanghaStatus(sangha.id, sangha.isActive)}
                            style={{
                              backgroundColor: sangha.isActive ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                              color: sangha.isActive ? '#f87171' : '#4ade80',
                              padding: '6px 16px',
                              borderRadius: '8px',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '500',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.opacity = '0.8'
                              e.currentTarget.style.transform = 'scale(1.05)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.opacity = '1'
                              e.currentTarget.style.transform = 'scale(1)'
                            }}
                          >
                            {sangha.isActive ? '🚫 Block' : '✅ Resume'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Footer with count */}
              <div style={{
                padding: '12px 16px',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                backgroundColor: 'rgba(255,255,255,0.02)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <span style={{ color: '#a5b4fc', fontSize: '13px' }}>
                  Total Sanghas: <strong style={{ color: 'white' }}>{sanghas.length}</strong>
                </span>
                <span style={{ color: '#a5b4fc', fontSize: '13px' }}>
                  Active: <strong style={{ color: '#4ade80' }}>{sanghas.filter(s => s.isActive).length}</strong>
                  {' '}•{' '}
                  Blocked: <strong style={{ color: '#f87171' }}>{sanghas.filter(s => !s.isActive).length}</strong>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}