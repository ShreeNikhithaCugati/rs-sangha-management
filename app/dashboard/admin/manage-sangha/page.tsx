'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Sangha {
  id: string
  sanghaId: string
  name: string
  code: string
  address: string | null
  state: string | null
  country: string | null
  city: string | null
  membersCount: number
  isActive: boolean
  createdAt: string
}

export default function ManageSanghaPage() {
  const [sangha, setSangha] = useState<Sangha | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))
    if (!token) {
      router.push('/login')
      return
    }
    fetchSanghaDetails()
  }, [])

  const fetchSanghaDetails = async () => {
    try {
      const response = await fetch('/api/admin/sangha-details')
      const data = await response.json()
      setSangha(data)
    } catch (error) {
      console.error('Error fetching sangha details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    document.cookie = 'token=; path=/; max-age=0'
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

  if (!sangha) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e1b4b, #4c1d95, #9d174d)',
        padding: '32px 24px',
        fontFamily: 'Arial, sans-serif',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(10px)',
            borderRadius: '14px',
            padding: '40px',
            border: '1px solid rgba(255,255,255,0.1)',
            textAlign: 'center',
          }}>
            <h2 style={{ color: 'white' }}>No Sangha Found</h2>
            <p style={{ color: '#a5b4fc' }}>Please contact Super Admin.</p>
            <button
              onClick={() => router.push('/dashboard/admin')}
              style={{
                marginTop: '16px',
                padding: '10px 24px',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ✅ Check if Sangha is deactivated
  if (!sangha.isActive) {
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
              🏛️ Manage Sangha
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

          <div style={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(10px)',
            borderRadius: '14px',
            padding: '60px 40px',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔒</div>
            <h2 style={{ color: '#fca5a5', fontSize: '28px', marginBottom: '12px' }}>
              Sangha Deactivated
            </h2>
            <p style={{ color: '#a5b4fc', fontSize: '16px', lineHeight: '1.8' }}>
              This Sangha has been <strong style={{ color: '#ef4444' }}>deactivated</strong> by the Super Admin.
              <br />
              You cannot manage or edit anything at this time.
              <br />
              Please contact the Super Admin for more information.
            </p>
            <div style={{
              marginTop: '24px',
              padding: '16px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '10px',
              color: '#fca5a5',
            }}>
              ⚠️ Account Deactivated
            </div>
            <button
              onClick={() => router.push('/dashboard/admin')}
              style={{
                marginTop: '24px',
                padding: '12px 32px',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ✅ Show normal manage page if active
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e1b4b, #4c1d95, #9d174d)',
      padding: '32px 24px',
      fontFamily: 'Arial, sans-serif',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* ... rest of your manage sangha page ... */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
        }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: 'white' }}>
            🏛️ Manage Sangha
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

        <div style={{
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(10px)',
          borderRadius: '14px',
          padding: '24px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
          }}>
            <div>
              <p style={{ color: '#a5b4fc', fontSize: '12px', margin: 0 }}>Sangha ID</p>
              <p style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>{sangha.sanghaId}</p>
            </div>
            <div>
              <p style={{ color: '#a5b4fc', fontSize: '12px', margin: 0 }}>Name</p>
              <p style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>{sangha.name}</p>
            </div>
            <div>
              <p style={{ color: '#a5b4fc', fontSize: '12px', margin: 0 }}>Total Members</p>
              <p style={{ color: 'white', fontSize: '18px' }}>{sangha.membersCount} / 20</p>
            </div>
            <div>
              <p style={{ color: '#a5b4fc', fontSize: '12px', margin: 0 }}>Status</p>
              <p style={{ color: '#86efac', fontSize: '18px' }}>🟢 Active</p>
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '16px',
          marginTop: '24px',
        }}>
          <button
            onClick={() => router.push('/dashboard/admin/add-member')}
            style={{
              padding: '12px 32px',
              backgroundColor: '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
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
            ➕ Add Member
          </button>
          <button
            onClick={() => router.push('/dashboard/admin')}
            style={{
              padding: '12px 32px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}