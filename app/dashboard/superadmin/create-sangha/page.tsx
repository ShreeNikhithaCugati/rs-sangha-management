'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SuperAdminSidebar from '@/components/SuperAdminSidebar'

export default function CreateSanghaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    state: '',
    country: 'India',
    city: '',
    district: '',
    town: '',
    village: '',
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/superadmin/create-sangha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create sangha')
      }

      setSuccess(`✅ Sangha created successfully! Sangha ID: ${data.sangha.sanghaId}`)
      
      // Reset form
      setFormData({
        name: '',
        address: '',
        state: '',
        country: 'India',
        city: '',
        district: '',
        town: '',
        village: '',
      })

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
      <SuperAdminSidebar />

      <div style={{ flex: 1, padding: '32px 24px', overflowX: 'hidden' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
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
                🏛️ Create Sangha
              </h1>
              <p style={{ color: '#a5b4fc', fontSize: '14px', marginTop: '4px' }}>
                Create a new Sangha in the system
              </p>
            </div>
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

          {success && (
            <div style={{
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(74, 222, 128, 0.3)',
              color: '#86efac',
              padding: '16px 20px',
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
              padding: '16px 20px',
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Sangha Name */}
                <div>
                  <label style={{ color: '#c7d2fe', fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                    Sangha Name *
                  </label>
                  <input
                    type="text"
                    name="name"
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
                    placeholder="Enter Sangha name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                {/* Country */}
                <div>
                  <label style={{ color: '#c7d2fe', fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                    Country *
                  </label>
                  <input
                    type="text"
                    name="country"
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
                    placeholder="Country"
                    value={formData.country}
                    onChange={handleChange}
                  />
                </div>

                {/* State */}
                <div>
                  <label style={{ color: '#c7d2fe', fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
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
                    placeholder="State"
                    value={formData.state}
                    onChange={handleChange}
                  />
                </div>

                {/* District */}
                <div>
                  <label style={{ color: '#c7d2fe', fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                    District *
                  </label>
                  <input
                    type="text"
                    name="district"
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
                    placeholder="District"
                    value={formData.district}
                    onChange={handleChange}
                  />
                </div>

                {/* City */}
                <div>
                  <label style={{ color: '#c7d2fe', fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
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
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>

                {/* Town */}
                <div>
                  <label style={{ color: '#c7d2fe', fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                    Town
                  </label>
                  <input
                    type="text"
                    name="town"
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
                    placeholder="Town (optional)"
                    value={formData.town}
                    onChange={handleChange}
                  />
                </div>

                {/* Village */}
                <div>
                  <label style={{ color: '#c7d2fe', fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                    Village
                  </label>
                  <input
                    type="text"
                    name="village"
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
                    placeholder="Village (optional)"
                    value={formData.village}
                    onChange={handleChange}
                  />
                </div>

                {/* Address */}
                <div>
                  <label style={{ color: '#c7d2fe', fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                    Address
                  </label>
                  <textarea
                    name="address"
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
                      minHeight: '80px',
                      resize: 'vertical'
                    }}
                    placeholder="Full address (optional)"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: '24px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                  opacity: loading ? 0.5 : 1
                }}
              >
                {loading ? 'Creating Sangha...' : '🏛️ Create Sangha'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}