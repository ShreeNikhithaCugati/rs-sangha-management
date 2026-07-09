'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SuperAdminSidebar from '@/components/SuperAdminSidebar'

interface Sangha {
  id: string
  sanghaId: string
  name: string
  address: string
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
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        router.push('/login')
        return
      }
      
      const sanghasRes = await fetch('/api/superadmin/sanghas', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const result = await sanghasRes.json()
      
      if (!sanghasRes.ok) {
        throw new Error(result.error || 'Failed to fetch sanghas')
      }
      
      const sanghasData = result.data || []
      
      if (!Array.isArray(sanghasData)) {
        setSanghas([])
        return
      }
      
      setSanghas(sanghasData)
      
    } catch (error) {
      console.error('❌ Error fetching data:', error)
      setSanghas([])
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

  const totalAdmins = sanghas.filter(s => s.admin).length
  const totalMembers = sanghas.reduce((acc, s) => acc + s.membersCount, 0)

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e1b4b, #4c1d95, #9d174d)',
      display: 'flex',
      fontFamily: 'Arial, sans-serif'
    }}>
      <SuperAdminSidebar />

      <div style={{ flex: 1, padding: '40px 32px', overflowX: 'hidden' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{
            marginBottom: '40px'
          }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: 'white',
              margin: 0
            }}>
              👑 Super Admin Dashboard
            </h1>
          </div>

          {/* Stats Cards - ONLY THESE 3 CARDS */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
          }}>
            {/* Card 1: Total Sanghas */}
            <div style={{
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '28px 24px',
              border: '1px solid rgba(255,255,255,0.1)',
              textAlign: 'center',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '8px'
              }}>
                🏛️
              </div>
              <p style={{
                color: '#a5b4fc',
                fontSize: '14px',
                fontWeight: '500',
                margin: '0 0 8px 0',
                letterSpacing: '0.5px'
              }}>
                Total Sanghas
              </p>
              <p style={{
                color: 'white',
                fontSize: '48px',
                fontWeight: '700',
                margin: 0,
                lineHeight: '1.2'
              }}>
                {sanghas.length}
              </p>
            </div>

            {/* Card 2: Admins Assigned */}
            <div style={{
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '28px 24px',
              border: '1px solid rgba(255,255,255,0.1)',
              textAlign: 'center',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '8px'
              }}>
                👤
              </div>
              <p style={{
                color: '#a5b4fc',
                fontSize: '14px',
                fontWeight: '500',
                margin: '0 0 8px 0',
                letterSpacing: '0.5px'
              }}>
                Admins Assigned
              </p>
              <p style={{
                color: 'white',
                fontSize: '48px',
                fontWeight: '700',
                margin: 0,
                lineHeight: '1.2'
              }}>
                {totalAdmins}
              </p>
            </div>

            {/* Card 3: Total Members */}
            <div style={{
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '28px 24px',
              border: '1px solid rgba(255,255,255,0.1)',
              textAlign: 'center',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '8px'
              }}>
                👥
              </div>
              <p style={{
                color: '#a5b4fc',
                fontSize: '14px',
                fontWeight: '500',
                margin: '0 0 8px 0',
                letterSpacing: '0.5px'
              }}>
                Total Members
              </p>
              <p style={{
                color: 'white',
                fontSize: '48px',
                fontWeight: '700',
                margin: 0,
                lineHeight: '1.2'
              }}>
                {totalMembers}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}