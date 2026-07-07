'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CompleteProfile() {
  const [formData, setFormData] = useState({
    // Sangha Details
    sanghaName: '',
    state: '',
    country: 'India',
    city: '',
    district: '',
    town: '',
    village: '',
    address: '',
    
    // Admin Details
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    adminAddress: '',
    aadharNumber: '',
  })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))
    if (!token) {
      router.push('/login')
      return
    }
  }, [])

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
    setMessage('')
    setError('')

    try {
      // Upload photo if exists
      let photoUrl = ''
      if (photoFile) {
        const photoFormData = new FormData()
        photoFormData.append('photo', photoFile)
        
        const photoResponse = await fetch('/api/upload', {
          method: 'POST',
          body: photoFormData,
        })
        const photoData = await photoResponse.json()
        if (photoResponse.ok) {
          photoUrl = photoData.url
        }
      }

      // Submit the request
      const response = await fetch('/api/admin/sangha-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          photo: photoUrl,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request')
      }

      setMessage('✅ Your Sangha creation request has been sent to Super Admin! You will be notified once approved.')
      
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/dashboard/admin')
      }, 3000)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e1b4b, #4c1d95, #9d174d)',
      padding: '40px 20px',
      fontFamily: 'Arial, sans-serif',
    }}>
      <div style={{
        maxWidth: '700px',
        margin: '0 auto',
        background: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
        padding: '40px',
        border: '1px solid rgba(255,255,255,0.15)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>
            🏛️ Complete Your Profile
          </h2>
          <p style={{ color: '#a5b4fc', fontSize: '14px' }}>
            Fill in the details to request your Sangha creation
          </p>
          <p style={{ color: '#86efac', fontSize: '12px', marginTop: '8px' }}>
            📌 Your request will be reviewed by Super Admin
          </p>
        </div>

        {message && (
          <div style={{
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(74, 222, 128, 0.3)',
            color: '#86efac',
            padding: '16px',
            borderRadius: '10px',
            fontSize: '14px',
            marginBottom: '20px',
            textAlign: 'center',
          }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{
            color: '#f87171',
            fontSize: '14px',
            textAlign: 'center',
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section 1: Sangha Details */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
              🏛️ Sangha Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#c7d2fe', marginBottom: '4px' }}>
                  Sangha Name *
                </label>
                <input
                  type="text"
                  required
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="Enter Sangha name"
                  value={formData.sanghaName}
                  onChange={(e) => setFormData({ ...formData, sanghaName: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#c7d2fe', marginBottom: '4px' }}>
                  Country *
                </label>
                <input
                  type="text"
                  required
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="Country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#c7d2fe', marginBottom: '4px' }}>
                  State *
                </label>
                <input
                  type="text"
                  required
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="State"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#c7d2fe', marginBottom: '4px' }}>
                  District *
                </label>
                <input
                  type="text"
                  required
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="District"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#c7d2fe', marginBottom: '4px' }}>
                  City *
                </label>
                <input
                  type="text"
                  required
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#c7d2fe', marginBottom: '4px' }}>
                  Town
                </label>
                <input
                  type="text"
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="Town (optional)"
                  value={formData.town}
                  onChange={(e) => setFormData({ ...formData, town: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#c7d2fe', marginBottom: '4px' }}>
                  Village
                </label>
                <input
                  type="text"
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="Village (optional)"
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#c7d2fe', marginBottom: '4px' }}>
                  Address *
                </label>
                <textarea
                  required
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box', minHeight: '70px', resize: 'vertical' }}
                  placeholder="Enter full address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Admin Details */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
              👤 Admin Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#c7d2fe', marginBottom: '4px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="Your full name"
                  value={formData.adminName}
                  onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#c7d2fe', marginBottom: '4px' }}>
                  Email *
                </label>
                <input
                  type="email"
                  required
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="Your email"
                  value={formData.adminEmail}
                  onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#c7d2fe', marginBottom: '4px' }}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="Phone number"
                  value={formData.adminPhone}
                  onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value })}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#c7d2fe', marginBottom: '4px' }}>
                  Current Address *
                </label>
                <input
                  type="text"
                  required
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="Your current address"
                  value={formData.adminAddress}
                  onChange={(e) => setFormData({ ...formData, adminAddress: e.target.value })}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#c7d2fe', marginBottom: '4px' }}>
                  Aadhar Number *
                </label>
                <input
                  type="text"
                  required
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="Enter Aadhar number"
                  value={formData.aadharNumber}
                  onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#c7d2fe', marginBottom: '4px' }}>
                  Upload Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', fontSize: '14px' }}
                />
                {photoPreview && (
                  <div style={{ marginTop: '10px' }}>
                    <img src={photoPreview} alt="Preview" style={{ maxWidth: '150px', borderRadius: '10px' }} />
                  </div>
                )}
              </div>
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
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
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
            {loading ? 'Submitting...' : 'Submit Request to Super Admin'}
          </button>
        </form>
      </div>
    </div>
  )
}