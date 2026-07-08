//app/dashboard/admin/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [sanghaId, setSanghaId] = useState('')
  const [isProfileComplete, setIsProfileComplete] = useState(false)
  const [hasPendingRequest, setHasPendingRequest] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    console.log('🔍 Token from localStorage:', token ? 'Yes' : 'No')
    
    if (!token) {
      router.push('/login')
      return
    }
    checkProfileStatus()
  }, [])

  const checkProfileStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch('/api/admin/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setIsProfileComplete(data.isProfileComplete)
      setHasPendingRequest(data.hasPendingRequest)
      if (data.sanghaId) {
        setSanghaId(data.sanghaId)
      }
    } catch (error) {
      console.error('Error checking profile status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e1b4b, #4c1d95, #9d174d)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif',
      }}>
        <div style={{ color: 'white', fontSize: '20px' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e1b4b, #4c1d95, #9d174d)',
      padding: '32px 24px',
      fontFamily: 'Arial, sans-serif',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
        }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: 'white' }}>
            👨‍💼 Admin Dashboard
          </h1>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: 'white',
              padding: '10px 24px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.2)',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>

        {isProfileComplete ? (
          <div style={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(10px)',
            borderRadius: '14px',
            padding: '40px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <h2 style={{ color: 'white', fontSize: '24px', marginBottom: '16px' }}>
              ✅ Welcome to Your Sangha!
            </h2>
            <p style={{ color: '#86efac', fontSize: '18px' }}>
              Sangha ID: <strong>{sanghaId}</strong>
            </p>
            <p style={{ color: '#a5b4fc', marginTop: '8px' }}>
              You can now start managing your Sangha and adding members.
            </p>
            
            <button
              onClick={() => router.push('/dashboard/admin/manage-sangha')}
              style={{
                marginTop: '20px',
                padding: '12px 32px',
                backgroundColor: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
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
              🏛️ Manage Sangha
            </button>
          </div>
        ) : (
          <div style={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(10px)',
            borderRadius: '14px',
            padding: '40px',
            border: '1px solid rgba(255,255,255,0.1)',
            textAlign: 'center',
          }}>
            <h2 style={{ color: 'white', fontSize: '24px', marginBottom: '16px' }}>
              ⏳ Request Pending
            </h2>
            <p style={{ color: '#a5b4fc', fontSize: '16px', lineHeight: '1.8' }}>
              Your Sangha creation request is being reviewed.
              <br />
              You will receive an email notification once approved.
            </p>
            <div style={{
              marginTop: '24px',
              padding: '16px',
              background: 'rgba(251, 191, 36, 0.1)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              borderRadius: '10px',
              color: '#fbbf24',
            }}>
              🕐 Status: Pending Approval
            </div>
          </div>
        )}
      </div>
    </div>
  )
}