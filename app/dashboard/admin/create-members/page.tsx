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

export default function CreateMembersPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [members, setMembers] = useState<Member[]>([])
  const [sanghaId, setSanghaId] = useState('')
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    aadharNumber: '',
  })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchMembers()
    getSanghaId()
  }, [])

  const getSanghaId = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.sanghaId) {
        setSanghaId(data.sanghaId)
      }
    } catch (error) {
      console.error('Error fetching sangha ID:', error)
    }
  }

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
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token')
      
      let photoUrl = ''
      if (photoFile) {
        const photoFormData = new FormData()
        photoFormData.append('photo', photoFile)
        
        const photoResponse = await fetch('/api/upload', {
          method: 'POST',
          body: photoFormData,
        })
        
        if (photoResponse.ok) {
          const photoData = await photoResponse.json()
          photoUrl = photoData.url
        }
      }

      const response = await fetch('/api/admin/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          photo: photoUrl,
          sanghaId: sanghaId,
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create member')
      }

      setSuccess(`✅ Member "${formData.name}" created successfully!`)
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        aadharNumber: '',
      })
      setPhotoFile(null)
      setPhotoPreview('')
      fetchMembers()

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
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
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{ color: 'white', fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
            👤 Create Members
          </h1>
          <p style={{ color: '#a5b4fc', fontSize: '14px', marginBottom: '24px' }}>
            Add new members to your Sangha
          </p>

          {success && (
            <div style={{
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(74, 222, 128, 0.3)',
              color: '#86efac',
              padding: '14px 18px',
              borderRadius: '10px',
              marginBottom: '20px'
            }}>
              {success}
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
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            borderRadius: '16px',
            padding: '32px',
            border: '1px solid rgba(255,255,255,0.15)'
          }}>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ color: '#c7d2fe', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ color: '#c7d2fe', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ color: '#c7d2fe', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ color: '#c7d2fe', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                    Aadhar Number
                  </label>
                  <input
                    type="text"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Enter Aadhar number (optional)"
                    value={formData.aadharNumber}
                    onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ color: '#c7d2fe', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                    Address
                  </label>
                  <textarea
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      minHeight: '70px',
                      resize: 'vertical'
                    }}
                    placeholder="Enter address (optional)"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ color: '#c7d2fe', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                    Upload Photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                  {photoPreview && (
                    <div style={{ marginTop: '10px' }}>
                      <img src={photoPreview} alt="Preview" style={{ maxWidth: '100px', borderRadius: '10px' }} />
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#22c55e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: '24px',
                  opacity: loading ? 0.5 : 1
                }}
              >
                {loading ? 'Creating...' : '👤 Create Member'}
              </button>
            </form>
          </div>

          {/* Members List */}
          <div style={{
            marginTop: '32px',
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(10px)',
            borderRadius: '14px',
            padding: '24px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
              📋 Members ({members.length})
            </h2>

            {members.length === 0 ? (
              <p style={{ color: '#a5b4fc', textAlign: 'center', padding: '20px' }}>
                No members added yet.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', color: '#a5b4fc' }}>Name</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', color: '#a5b4fc' }}>Email</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', color: '#a5b4fc' }}>Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr key={member.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '8px 12px' }}>{member.name}</td>
                        <td style={{ padding: '8px 12px', color: '#a5b4fc' }}>{member.email}</td>
                        <td style={{ padding: '8px 12px', color: '#a5b4fc' }}>{member.phone}</td>
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