'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'

interface Member {
  id: string
  name: string
  email: string
  phone: string
  address: string
  aadharNumber: string
  photo: string | null
  createdAt: string
}

export default function MembersListPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/members', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (response.ok) {
        setMembers(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching members:', error)
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
      <AdminSidebar />

      <div style={{
        flex: 1,
        padding: '32px 24px',
        overflowX: 'hidden',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ color: 'white', fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
            📋 Members List
          </h1>
          <p style={{ color: '#a5b4fc', fontSize: '14px', marginBottom: '24px' }}>
            View all members in your Sangha
          </p>

          <div style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(10px)',
            borderRadius: '14px',
            padding: '24px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            {members.length === 0 ? (
              <p style={{ color: '#a5b4fc', textAlign: 'center', padding: '40px 0' }}>
                No members found. Create your first member!
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left', color: '#a5b4fc' }}>Name</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', color: '#a5b4fc' }}>Email</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', color: '#a5b4fc' }}>Phone</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', color: '#a5b4fc' }}>Address</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center', color: '#a5b4fc' }}>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr key={member.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '10px 12px', fontWeight: '500' }}>{member.name}</td>
                        <td style={{ padding: '10px 12px', color: '#a5b4fc' }}>{member.email}</td>
                        <td style={{ padding: '10px 12px', color: '#a5b4fc' }}>{member.phone}</td>
                        <td style={{ padding: '10px 12px', color: '#a5b4fc' }}>{member.address || 'N/A'}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', color: '#a5b4fc', fontSize: '12px' }}>
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