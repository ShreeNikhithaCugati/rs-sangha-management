'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import SuperAdminSidebar from '@/components/SuperAdminSidebar'

interface RequestDetails {
  id: string
  sanghaName: string
  state: string
  country: string
  city: string
  district: string
  town: string | null
  village: string | null
  address: string
  adminName: string
  adminEmail: string
  adminPhone: string
  adminAddress: string
  aadharNumber: string
  photo: string | null
  status: string
  createdAt: string
  assignedSanghaId: string | null
  rejectedReason: string | null
  admin: {
    id: string
    name: string
    email: string
    username: string
  }
}

export default function RequestDetailsPage() {
  const [request, setRequest] = useState<RequestDetails | null>(null)
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
    fetchRequestDetails()
  }, [])

  const fetchRequestDetails = async () => {
  try {
    const token = localStorage.getItem('token')
    
    if (!token) {
      router.push('/login')
      return
    }

    const response = await fetch(`/api/superadmin/sangha-requests/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    const data = await response.json()
    setRequest(data)
  } catch (error) {
    console.error('Error fetching request details:', error)
  } finally {
    setLoading(false)
  }
}

const handleApprove = async () => {
  const sanghaId = prompt('Enter Sangha ID for this admin (or leave blank for auto-generate):')
  if (sanghaId === null) return
  
  try {
    const token = localStorage.getItem('token')
    
    const response = await fetch(`/api/superadmin/sangha-requests/${id}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ action: 'approve', sanghaId: sanghaId || undefined }),
    })

    const data = await response.json()

    if (response.ok) {
      alert(`✅ ${data.message}`)
      router.push('/dashboard/superadmin/requests')
    } else {
      alert('❌ ' + data.error)
    }
  } catch (error) {
    console.error('Error approving request:', error)
    alert('❌ Error approving request')
  }
}

const handleReject = async () => {
  const reason = prompt('Enter reason for rejection:')
  if (!reason) return

  try {
    const token = localStorage.getItem('token')
    
    const response = await fetch(`/api/superadmin/sangha-requests/${id}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ action: 'reject', rejectedReason: reason }),
    })

    const data = await response.json()

    if (response.ok) {
      alert(`✅ ${data.message}`)
      router.push('/dashboard/superadmin/requests')
    } else {
      alert('❌ ' + data.error)
    }
  } catch (error) {
    console.error('Error rejecting request:', error)
    alert('❌ Error rejecting request')
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

  if (!request) {
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
            <h2 style={{ color: 'white' }}>Request not found</h2>
            <button
              onClick={() => router.push('/dashboard/superadmin/requests')}
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
              Back to Requests
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
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Back Button */}
          <button
            onClick={() => router.push('/dashboard/superadmin/requests')}
            style={{
              background: 'none',
              border: 'none',
              color: '#a5b4fc',
              fontSize: '14px',
              cursor: 'pointer',
              marginBottom: '16px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#a5b4fc'}
          >
            ← Back to Requests
          </button>

          <div style={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            borderRadius: '16px',
            padding: '32px',
            border: '1px solid rgba(255,255,255,0.15)'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <h1 style={{ color: 'white', fontSize: '28px', fontWeight: '700', margin: 0 }}>
                  {request.sanghaName}
                </h1>
                <p style={{ color: '#a5b4fc', fontSize: '14px', marginTop: '4px' }}>
                  Requested by {request.admin.name} • {new Date(request.createdAt).toLocaleString()}
                </p>
              </div>
              <span style={{
                background: request.status === 'PENDING' ? 'rgba(251, 191, 36, 0.2)' : 
                           request.status === 'APPROVED' ? 'rgba(34, 197, 94, 0.2)' : 
                           'rgba(239, 68, 68, 0.2)',
                color: request.status === 'PENDING' ? '#fbbf24' : 
                       request.status === 'APPROVED' ? '#86efac' : '#fca5a5',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {request.status}
              </span>
            </div>

            {/* Request Details */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginTop: '16px'
            }}>
              {/* Sangha Details */}
              <div style={{
                gridColumn: '1 / -1',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                paddingBottom: '12px',
                marginBottom: '12px'
              }}>
                <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                  🏛️ Sangha Details
                </h3>
              </div>

              <div>
                <label style={{ color: '#a5b4fc', fontSize: '12px', display: 'block' }}>Sangha Name</label>
                <p style={{ color: 'white', fontSize: '16px', margin: '4px 0 0 0' }}>{request.sanghaName}</p>
              </div>
              <div>
                <label style={{ color: '#a5b4fc', fontSize: '12px', display: 'block' }}>Country</label>
                <p style={{ color: 'white', fontSize: '16px', margin: '4px 0 0 0' }}>{request.country}</p>
              </div>
              <div>
                <label style={{ color: '#a5b4fc', fontSize: '12px', display: 'block' }}>State</label>
                <p style={{ color: 'white', fontSize: '16px', margin: '4px 0 0 0' }}>{request.state}</p>
              </div>
              <div>
                <label style={{ color: '#a5b4fc', fontSize: '12px', display: 'block' }}>District</label>
                <p style={{ color: 'white', fontSize: '16px', margin: '4px 0 0 0' }}>{request.district}</p>
              </div>
              <div>
                <label style={{ color: '#a5b4fc', fontSize: '12px', display: 'block' }}>City</label>
                <p style={{ color: 'white', fontSize: '16px', margin: '4px 0 0 0' }}>{request.city}</p>
              </div>
              <div>
                <label style={{ color: '#a5b4fc', fontSize: '12px', display: 'block' }}>Town</label>
                <p style={{ color: 'white', fontSize: '16px', margin: '4px 0 0 0' }}>{request.town || 'N/A'}</p>
              </div>
              <div>
                <label style={{ color: '#a5b4fc', fontSize: '12px', display: 'block' }}>Village</label>
                <p style={{ color: 'white', fontSize: '16px', margin: '4px 0 0 0' }}>{request.village || 'N/A'}</p>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ color: '#a5b4fc', fontSize: '12px', display: 'block' }}>Address</label>
                <p style={{ color: 'white', fontSize: '16px', margin: '4px 0 0 0' }}>{request.address}</p>
              </div>

              {/* Admin Details */}
              <div style={{
                gridColumn: '1 / -1',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                paddingBottom: '12px',
                marginBottom: '12px',
                marginTop: '8px'
              }}>
                <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                  👤 Admin Details
                </h3>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ color: '#a5b4fc', fontSize: '12px', display: 'block' }}>Full Name</label>
                <p style={{ color: 'white', fontSize: '16px', margin: '4px 0 0 0' }}>{request.adminName}</p>
              </div>
              <div>
                <label style={{ color: '#a5b4fc', fontSize: '12px', display: 'block' }}>Email</label>
                <p style={{ color: 'white', fontSize: '16px', margin: '4px 0 0 0' }}>{request.adminEmail}</p>
              </div>
              <div>
                <label style={{ color: '#a5b4fc', fontSize: '12px', display: 'block' }}>Phone</label>
                <p style={{ color: 'white', fontSize: '16px', margin: '4px 0 0 0' }}>{request.adminPhone}</p>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ color: '#a5b4fc', fontSize: '12px', display: 'block' }}>Current Address</label>
                <p style={{ color: 'white', fontSize: '16px', margin: '4px 0 0 0' }}>{request.adminAddress}</p>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ color: '#a5b4fc', fontSize: '12px', display: 'block' }}>Aadhar Number</label>
                <p style={{ color: 'white', fontSize: '16px', margin: '4px 0 0 0' }}>{request.aadharNumber}</p>
              </div>
              {request.photo && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ color: '#a5b4fc', fontSize: '12px', display: 'block' }}>Photo</label>
                  <img 
                    src={request.photo} 
                    alt="Admin Photo" 
                    style={{ maxWidth: '150px', borderRadius: '10px', marginTop: '8px' }}
                  />
                </div>
              )}
            </div>

            {/* Status Message */}
            {request.status !== 'PENDING' && (
              <div style={{
                marginTop: '24px',
                padding: '16px',
                background: request.status === 'APPROVED' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                borderRadius: '10px',
                textAlign: 'center'
              }}>
                <p style={{
                  color: request.status === 'APPROVED' ? '#86efac' : '#fca5a5',
                  fontSize: '16px',
                  fontWeight: '500'
                }}>
                  {request.status === 'APPROVED' 
                    ? `✅ Approved - Sangha ID: ${request.assignedSanghaId}`
                    : `❌ Rejected - Reason: ${request.rejectedReason || 'No reason provided'}`
                  }
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {request.status === 'PENDING' && (
              <div style={{
                display: 'flex',
                gap: '16px',
                marginTop: '32px',
                paddingTop: '20px',
                borderTop: '1px solid rgba(255,255,255,0.1)'
              }}>
                <button
                  onClick={handleApprove}
                  style={{
                    flex: 1,
                    padding: '14px',
                    backgroundColor: '#22c55e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#22c55e'}
                >
                  ✅ Approve Request
                </button>
                <button
                  onClick={handleReject}
                  style={{
                    flex: 1,
                    padding: '14px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                >
                  ❌ Reject Request
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}