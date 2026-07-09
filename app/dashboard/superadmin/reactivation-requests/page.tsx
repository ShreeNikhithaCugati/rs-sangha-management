//app/dashboard/superadmin/reactivation-requests/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SuperAdminSidebar from '@/components/SuperAdminSidebar'

interface ReactivationRequest {
  id: string
  sanghaId: string
  adminName: string
  adminEmail: string
  adminPhone: string
  reason: string
  additionalInfo: string
  status: string
  createdAt: string
  reviewedAt: string | null
  reviewedBy: string | null
  rejectionReason: string | null
  sangha: {
    id: string
    sanghaId: string
    name: string
    isActive: boolean
  }
}

export default function ReactivationRequestsPage() {
  const [requests, setRequests] = useState<ReactivationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [processingId, setProcessingId] = useState('')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    console.log('🔍 Token:', token ? 'Yes' : 'No')
    if (!token) {
      router.push('/login')
      return
    }
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token')
      console.log('📤 Fetching reactivation requests...')
      
      const response = await fetch('/api/superadmin/reactivation-requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('📊 Response status:', response.status)

      if (response.status === 401 || response.status === 403) {
        router.push('/login')
        return
      }

      const result = await response.json()
      console.log('📥 Response data:', result)

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch requests')
      }

      setRequests(result.data || [])
      setError('')
    } catch (error) {
      console.error('❌ Error fetching requests:', error)
      setError('Failed to load reactivation requests. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (requestId: string, action: 'approve' | 'reject') => {
    setProcessingId(requestId)
    setError('')
    setMessage('')

    let rejectionReason = ''
    if (action === 'reject') {
      rejectionReason = prompt('Enter reason for rejection:') || ''
      if (!rejectionReason) {
        setProcessingId('')
        return
      }
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/superadmin/reactivation-requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          action, 
          rejectionReason 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process request')
      }

      setMessage(`✅ Request ${action}ed successfully!`)
      fetchRequests()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setProcessingId('')
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

  const pendingCount = requests.filter(r => r.status === 'PENDING').length

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
              <h1 style={{ color: 'white', fontSize: '28px', fontWeight: '700', margin: 0 }}>
                🔄 Activation Requests
              </h1>
              <p style={{ color: '#a5b4fc', fontSize: '14px', marginTop: '4px' }}>
                Manage Sangha reactivation requests from admins
              </p>
            </div>
            <div style={{
              background: 'rgba(251, 191, 36, 0.2)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              borderRadius: '10px',
              padding: '8px 20px'
            }}>
              <span style={{ color: '#fbbf24', fontSize: '14px', fontWeight: '600' }}>
                Pending: {pendingCount}
              </span>
            </div>
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
              ❌ {error}
            </div>
          )}

          <div style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(10px)',
            borderRadius: '14px',
            padding: '24px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            {requests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                <p style={{ color: '#a5b4fc', fontSize: '16px' }}>No reactivation requests found.</p>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>All Sanghas are currently active.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left', color: '#a5b4fc' }}>Sangha</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', color: '#a5b4fc' }}>Admin</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', color: '#a5b4fc' }}>Reason</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center', color: '#a5b4fc' }}>Date</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center', color: '#a5b4fc' }}>Status</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center', color: '#a5b4fc' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr key={req.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ fontWeight: '500' }}>{req.sangha?.name || 'N/A'}</div>
                          <div style={{ fontSize: '12px', color: '#818cf8' }}>{req.sangha?.sanghaId || req.sanghaId}</div>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ fontWeight: '500' }}>{req.adminName}</div>
                          <div style={{ fontSize: '12px', color: '#a5b4fc' }}>{req.adminEmail}</div>
                        </td>
                        <td style={{ padding: '10px 12px', color: '#a5b4fc' }}>
                          <div style={{ maxWidth: '200px', wordBreak: 'break-word' }}>{req.reason}</div>
                          {req.additionalInfo && (
                            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                              📝 {req.additionalInfo}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', color: '#a5b4fc', fontSize: '12px' }}>
                          {new Date(req.createdAt).toLocaleDateString()}
                          <br />
                          <span style={{ fontSize: '11px', color: '#6b7280' }}>
                            {new Date(req.createdAt).toLocaleTimeString()}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: req.status === 'PENDING' ? 'rgba(251, 191, 36, 0.2)' :
                                         req.status === 'APPROVED' ? 'rgba(34, 197, 94, 0.2)' :
                                         'rgba(239, 68, 68, 0.2)',
                            color: req.status === 'PENDING' ? '#fbbf24' :
                                   req.status === 'APPROVED' ? '#4ade80' :
                                   '#f87171'
                          }}>
                            {req.status}
                          </span>
                          {req.rejectionReason && req.status === 'REJECTED' && (
                            <div style={{ fontSize: '11px', color: '#f87171', marginTop: '4px' }}>
                              Reason: {req.rejectionReason}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          {req.status === 'PENDING' ? (
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                              <button
                                onClick={() => handleAction(req.id, 'approve')}
                                disabled={processingId === req.id}
                                style={{
                                  padding: '6px 16px',
                                  backgroundColor: '#22c55e',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: processingId === req.id ? 'not-allowed' : 'pointer',
                                  fontSize: '13px',
                                  opacity: processingId === req.id ? 0.5 : 1,
                                  transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#22c55e'}
                              >
                                ✅ Approve
                              </button>
                              <button
                                onClick={() => handleAction(req.id, 'reject')}
                                disabled={processingId === req.id}
                                style={{
                                  padding: '6px 16px',
                                  backgroundColor: '#ef4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: processingId === req.id ? 'not-allowed' : 'pointer',
                                  fontSize: '13px',
                                  opacity: processingId === req.id ? 0.5 : 1,
                                  transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                              >
                                ❌ Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ color: '#6b7280', fontSize: '13px' }}>
                              {req.status === 'APPROVED' ? '✅ Approved' : '❌ Rejected'}
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