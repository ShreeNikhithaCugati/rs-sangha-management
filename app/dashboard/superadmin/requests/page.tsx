'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SuperAdminSidebar from '@/components/SuperAdminSidebar'

interface SanghaRequest {
  id: string
  sanghaName: string
  state: string
  country: string
  city: string
  district: string
  address: string
  adminName: string
  adminEmail: string
  adminPhone: string
  status: string
  createdAt: string
  admin: {
    id: string
    name: string
    email: string
    username: string
  }
}

export default function SanghaRequestsPage() {
  const [requests, setRequests] = useState<SanghaRequest[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // ✅ Check localStorage for token
    const token = localStorage.getItem('token')
    console.log('🔍 Token from localStorage:', token ? 'Yes' : 'No')
    
    if (!token) {
      router.push('/login')
      return
    }
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.log('❌ No token found')
        router.push('/login')
        return
      }

      console.log('🔑 Fetching requests with token:', token.substring(0, 20) + '...')

      const response = await fetch('/api/superadmin/sangha-requests', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('📊 Response status:', response.status)

      if (response.status === 401 || response.status === 403) {
        console.log('❌ Unauthorized, redirecting to login')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
        return
      }

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ API Error:', errorData)
        setRequests([])
        return
      }

      const data = await response.json()
      console.log('✅ Requests fetched:', data)
      setRequests(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('❌ Error fetching requests:', error)
      setRequests([])
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
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: 'white',
            marginBottom: '24px'
          }}>
            📝 Sangha Creation Requests
          </h1>

          <div style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(10px)',
            borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden'
          }}>
            {requests.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#a5b4fc' }}>
                No pending Sangha creation requests.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                  <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <tr>
                      <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '12px', color: '#a5b4fc', fontWeight: '500' }}>Admin</th>
                      <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '12px', color: '#a5b4fc', fontWeight: '500' }}>Sangha Name</th>
                      <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '12px', color: '#a5b4fc', fontWeight: '500' }}>Location</th>
                      <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '12px', color: '#a5b4fc', fontWeight: '500' }}>Requested</th>
                      <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '12px', color: '#a5b4fc', fontWeight: '500' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr key={req.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ fontWeight: '500' }}>{req.admin.name}</div>
                          <div style={{ fontSize: '13px', color: '#a5b4fc' }}>{req.admin.email}</div>
                        </td>
                        <td style={{ padding: '14px 18px' }}>{req.sanghaName}</td>
                        <td style={{ padding: '14px 18px', color: '#a5b4fc' }}>
                          {req.city}, {req.state}, {req.country}
                        </td>
                        <td style={{ padding: '14px 18px', color: '#a5b4fc' }}>
                          <div>{new Date(req.createdAt).toLocaleDateString()}</div>
                          <div style={{ fontSize: '11px', color: '#86efac' }}>
                            {new Date(req.createdAt).toLocaleTimeString()}
                          </div>
                        </td>
                        <td style={{ padding: '14px 18px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => router.push(`/dashboard/superadmin/request-details/${req.id}`)}
                            style={{
                              background: 'rgba(255,255,255,0.1)',
                              color: 'white',
                              padding: '6px 16px',
                              borderRadius: '6px',
                              border: '1px solid rgba(255,255,255,0.2)',
                              cursor: 'pointer',
                              fontSize: '13px',
                              transition: 'all 0.3s ease',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                          >
                            View Details
                          </button>
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