'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import SuperAdminSidebar from '@/components/SuperAdminSidebar'

interface Member {
  id: string
  name: string
  email: string
  phone: string | null
  address: string | null
  createdAt: string
}

interface SanghaData {
  id: string
  sanghaId: string
  name: string
  code: string
  address: string | null
  state: string | null
  country: string | null
  city: string | null
  isActive: boolean
  membersCount: number
  createdAt: string
  admin: {
    id: string
    name: string
    email: string
    username: string
    phone: string | null
  } | null
  members: Member[]
}

export default function ViewSanghaPage() {
  const [sangha, setSangha] = useState<SanghaData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const id = params.id

  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))
    if (!token) {
      router.push('/login')
      return
    }
    fetchSanghaData()
  }, [])

  const fetchSanghaData = async () => {
    try {
      const response = await fetch(`/api/superadmin/view-sangha/${id}`)
      const data = await response.json()
      setSangha(data)
    } catch (error) {
      console.error('Error fetching sangha data:', error)
    } finally {
      setLoading(false)
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
        <div style={{ color: 'white', fontSize: '20px' }}>Loading...</div>
      </div>
    )
  }

  if (!sangha) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e1b4b, #4c1d95, #9d174d)',
        display: 'flex',
        fontFamily: 'Arial, sans-serif'
      }}>
        <SuperAdminSidebar />
        <div style={{ flex: 1, padding: '32px 24px' }}>
          <div style={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            borderRadius: '16px',
            padding: '40px',
            border: '1px solid rgba(255,255,255,0.15)',
            textAlign: 'center'
          }}>
            <h2 style={{ color: 'white' }}>Sangha not found</h2>
            <button
              onClick={() => router.push('/dashboard/superadmin/sanghas')}
              style={{
                marginTop: '16px',
                padding: '10px 24px',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Back to Sanghas
            </button>
          </div>
        </div>
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
            marginBottom: '24px'
          }}>
            <div>
              <button
                onClick={() => router.push('/dashboard/superadmin/sanghas')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#a5b4fc',
                  fontSize: '14px',
                  cursor: 'pointer',
                  marginBottom: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#a5b4fc'}
              >
                ← Back to Sanghas
              </button>
              <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'white', margin: 0 }}>
                🏛️ {sangha.name}
              </h1>
              <p style={{ color: '#a5b4fc', fontSize: '14px' }}>
                Sangha ID: {sangha.sanghaId} • Admin: {sangha.admin?.name || 'No admin assigned'}
              </p>
            </div>
            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <span style={{
                background: sangha.isActive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: sangha.isActive ? '#86efac' : '#fca5a5',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {sangha.isActive ? '🟢 Active' : '🔴 Inactive'}
              </span>
            </div>
          </div>

          {/* Admin Info */}
          {sangha.admin && (
            <div style={{
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(10px)',
              borderRadius: '14px',
              padding: '20px 24px',
              border: '1px solid rgba(255,255,255,0.1)',
              marginBottom: '24px'
            }}>
              <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                👤 Admin Information
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px'
              }}>
                <div>
                  <p style={{ color: '#a5b4fc', fontSize: '12px', margin: 0 }}>Name</p>
                  <p style={{ color: 'white', fontSize: '16px', margin: '4px 0 0 0' }}>{sangha.admin.name}</p>
                </div>
                <div>
                  <p style={{ color: '#a5b4fc', fontSize: '12px', margin: 0 }}>Username</p>
                  <p style={{ color: 'white', fontSize: '16px', margin: '4px 0 0 0' }}>{sangha.admin.username}</p>
                </div>
                <div>
                  <p style={{ color: '#a5b4fc', fontSize: '12px', margin: 0 }}>Email</p>
                  <p style={{ color: 'white', fontSize: '16px', margin: '4px 0 0 0' }}>{sangha.admin.email}</p>
                </div>
                <div>
                  <p style={{ color: '#a5b4fc', fontSize: '12px', margin: 0 }}>Phone</p>
                  <p style={{ color: 'white', fontSize: '16px', margin: '4px 0 0 0' }}>{sangha.admin.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(10px)',
              borderRadius: '10px',
              padding: '16px',
              border: '1px solid rgba(255,255,255,0.1)',
              textAlign: 'center'
            }}>
              <p style={{ color: '#a5b4fc', fontSize: '12px', margin: 0 }}>Total Members</p>
              <p style={{ color: 'white', fontSize: '28px', fontWeight: '700', margin: '4px 0 0 0' }}>{sangha.membersCount} / 20</p>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(10px)',
              borderRadius: '10px',
              padding: '16px',
              border: '1px solid rgba(255,255,255,0.1)',
              textAlign: 'center'
            }}>
              <p style={{ color: '#a5b4fc', fontSize: '12px', margin: 0 }}>Created</p>
              <p style={{ color: 'white', fontSize: '16px', fontWeight: '600', margin: '4px 0 0 0' }}>
                {new Date(sangha.createdAt).toLocaleDateString()}
              </p>
              <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>
                {new Date(sangha.createdAt).toLocaleTimeString()}
              </p>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(10px)',
              borderRadius: '10px',
              padding: '16px',
              border: '1px solid rgba(255,255,255,0.1)',
              textAlign: 'center'
            }}>
              <p style={{ color: '#a5b4fc', fontSize: '12px', margin: 0 }}>Sangha Code</p>
              <p style={{ color: 'white', fontSize: '20px', fontWeight: '600', margin: '4px 0 0 0' }}>{sangha.code}</p>
            </div>
            {sangha.address && (
              <div style={{
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(10px)',
                borderRadius: '10px',
                padding: '16px',
                border: '1px solid rgba(255,255,255,0.1)',
                textAlign: 'center',
                gridColumn: '1 / -1'
              }}>
                <p style={{ color: '#a5b4fc', fontSize: '12px', margin: 0 }}>Address</p>
                <p style={{ color: 'white', fontSize: '14px', margin: '4px 0 0 0' }}>{sangha.address}</p>
              </div>
            )}
          </div>

          {/* Members List */}
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(10px)',
            borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '600', margin: 0 }}>
                👥 Members ({sangha.members.length})
              </h3>
            </div>
            {sangha.members.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#a5b4fc' }}>
                No members added yet.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                  <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <tr>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#a5b4fc', fontWeight: '500' }}>Name</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#a5b4fc', fontWeight: '500' }}>Email</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#a5b4fc', fontWeight: '500' }}>Phone</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#a5b4fc', fontWeight: '500' }}>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sangha.members.map((member) => (
                      <tr key={member.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px 16px' }}>{member.name}</td>
                        <td style={{ padding: '12px 16px', color: '#a5b4fc' }}>{member.email}</td>
                        <td style={{ padding: '12px 16px', color: '#a5b4fc' }}>{member.phone || 'N/A'}</td>
                        <td style={{ padding: '12px 16px', color: '#a5b4fc' }}>
                          {new Date(member.createdAt).toLocaleDateString()}
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