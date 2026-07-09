'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [sanghaId, setSanghaId] = useState('')
  const [isProfileComplete, setIsProfileComplete] = useState(false)
  const [hasPendingRequest, setHasPendingRequest] = useState(false)
  const [showDeactivationMessage, setShowDeactivationMessage] = useState(false)
  const [deactivationMessage, setDeactivationMessage] = useState('')
  const [showReactivationForm, setShowReactivationForm] = useState(false)
  const [reactivationSuccess, setReactivationSuccess] = useState(false)
  const [reactivationError, setReactivationError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userPhone, setUserPhone] = useState('')
  const router = useRouter()

  // Reactivation form state
  const [reactivationForm, setReactivationForm] = useState({
    reason: '',
    additionalInfo: '',
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    console.log('🔍 Token from localStorage:', token ? 'Yes' : 'No')
    
    if (!token) {
      router.push('/login')
      return
    }
    
    // Get user data from localStorage (fallback)
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        console.log('🔍 User data from localStorage:', user)
        setUserName(user.name || '')
        setUserEmail(user.email || '')
        setUserPhone(user.phone || user.phoneNumber || '')
      } catch (e) {
        console.error('Error parsing user:', e)
      }
    }
    
    // Initial check - this will also update phone from API
    checkProfileStatus()
    
    // Check account status every 10 seconds
    const interval = setInterval(() => {
      checkAccountStatus()
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  // Check account status - UPDATED to update phone
  const checkAccountStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.log('❌ No token found')
        return
      }

      console.log('🔍 Checking account status...')

      const response = await fetch('/api/admin/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      console.log('🔍 Status check response:', data)

      if (!response.ok) {
        console.error('Status check failed:', data)
        return
      }

      // UPDATE USER DATA FROM API (including phone)
      if (data.user) {
        console.log('📱 Phone from API:', data.user.phone || 'Not found')
        setUserName(data.user.name || userName)
        setUserEmail(data.user.email || userEmail)
        setUserPhone(data.user.phone || '')
        console.log('📱 Phone set to:', data.user.phone || '')
      }

      // CHECK DEACTIVATION
      const isUserInactive = data.isActive === false
      const isSanghaInactive = data.sanghaIsActive === false
      const isDeactivated = isUserInactive || isSanghaInactive

      console.log('🔍 isUserInactive:', isUserInactive)
      console.log('🔍 isSanghaInactive:', isSanghaInactive)
      console.log('🔍 isDeactivated:', isDeactivated)

      if (isDeactivated) {
        console.log('🚫 DEACTIVATED! Showing popup...')
        setShowDeactivationMessage(true)
        setDeactivationMessage('Your Sangha has been deactivated. Please contact Super Admin or request reactivation.')
      } else {
        console.log('✅ Account is active')
      }
    } catch (error) {
      console.error('Error checking account status:', error)
    }
  }

  const checkProfileStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/admin/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      
      console.log('📊 Profile status data:', data)
      
      setIsProfileComplete(data.isProfileComplete)
      setHasPendingRequest(data.hasPendingRequest)
      
      if (data.sanghaId) {
        setSanghaId(data.sanghaId)
      }
      
      // UPDATE USER INFO FROM API (including phone)
      if (data.user) {
        console.log('📱 Phone from API (profile):', data.user.phone || 'Not found')
        setUserName(data.user.name || '')
        setUserEmail(data.user.email || '')
        setUserPhone(data.user.phone || '')
        console.log('📱 Phone set to:', data.user.phone || '')
      }
    } catch (error) {
      console.error('Error checking profile status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReactivationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setReactivationError('')
    
    console.log('📱 Submitting with phone:', userPhone)
    
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch('/api/admin/reactivation-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sanghaId: sanghaId,
          adminName: userName,
          adminEmail: userEmail,
          adminPhone: userPhone,
          reason: reactivationForm.reason,
          additionalInfo: reactivationForm.additionalInfo,
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request')
      }

      setReactivationSuccess(true)
      setShowReactivationForm(false)
      setReactivationForm({ reason: '', additionalInfo: '' })
      
      setTimeout(() => {
        setReactivationSuccess(false)
        setShowDeactivationMessage(false)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
      }, 5000)

    } catch (error: any) {
      setReactivationError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  // ⭐ FIXED: Manual check function with better error handling
  const handleManualCheck = async () => {
    console.log('🔍 Manual check triggered...')
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.log('❌ No token found')
        alert('Please login again')
        router.push('/login')
        return
      }

      const response = await fetch('/api/admin/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      console.log('📊 Manual check response:', data)

      if (!response.ok) {
        console.error('Status check failed:', data)
        alert('Status check failed: ' + (data.error || 'Unknown error'))
        return
      }

      // Update user data from API
      if (data.user) {
        setUserName(data.user.name || userName)
        setUserEmail(data.user.email || userEmail)
        setUserPhone(data.user.phone || userPhone)
        console.log('📱 Updated user data:', data.user)
      }

      // Check deactivation
      const isUserInactive = data.isActive === false
      const isSanghaInactive = data.sanghaIsActive === false
      const isDeactivated = isUserInactive || isSanghaInactive

      console.log('🔍 isUserInactive:', isUserInactive)
      console.log('🔍 isSanghaInactive:', isSanghaInactive)
      console.log('🔍 isDeactivated:', isDeactivated)

      if (isDeactivated) {
        console.log('🚫 DEACTIVATED! Showing popup...')
        setShowDeactivationMessage(true)
        setDeactivationMessage('Your Sangha has been deactivated. Please contact Super Admin or request reactivation.')
      } else {
        alert('✅ Your account is active!')
      }
    } catch (error) {
      console.error('❌ Error in manual check:', error)
      alert('Error checking status. Check console for details.')
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
        fontFamily: 'Arial, sans-serif',
      }}>
        <div style={{ color: 'white', fontSize: '20px' }}>Loading...</div>
      </div>
    )
  }

  // Deactivation Popup
  if (showDeactivationMessage) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e1b4b, #4c1d95, #9d174d)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
      }}>
        <div style={{
          maxWidth: '550px',
          width: '100%',
          padding: '40px',
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.15)',
          textAlign: 'center',
        }}>
          {reactivationSuccess ? (
            <>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
              <h2 style={{ color: 'white', fontSize: '24px', marginBottom: '12px' }}>
                Request Submitted!
              </h2>
              <p style={{ color: '#86efac', fontSize: '16px', lineHeight: '1.6' }}>
                Your reactivation request has been sent to Super Admin.
                <br />
                You will be notified once approved.
              </p>
              <p style={{ color: '#a5b4fc', fontSize: '14px', marginTop: '12px' }}>
                Redirecting to login page...
              </p>
            </>
          ) : showReactivationForm ? (
            <>
              <h2 style={{ color: 'white', fontSize: '22px', marginBottom: '8px' }}>
                📝 Request Reactivation
              </h2>
              <p style={{ color: '#a5b4fc', fontSize: '14px', marginBottom: '20px' }}>
                Fill in the details to request Sangha reactivation
              </p>
              
              <form onSubmit={handleReactivationSubmit}>
                <div style={{ textAlign: 'left', marginBottom: '14px' }}>
                  <label style={{ color: '#c7d2fe', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                    Sangha ID
                  </label>
                  <input
                    type="text"
                    value={sanghaId}
                    disabled
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '10px',
                      color: '#818cf8',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      cursor: 'not-allowed',
                    }}
                  />
                </div>

                <div style={{ textAlign: 'left', marginBottom: '14px' }}>
                  <label style={{ color: '#c7d2fe', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                    Admin Name
                  </label>
                  <input
                    type="text"
                    value={userName}
                    disabled
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '10px',
                      color: '#a5b4fc',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      cursor: 'not-allowed',
                    }}
                  />
                </div>

                <div style={{ textAlign: 'left', marginBottom: '14px' }}>
                  <label style={{ color: '#c7d2fe', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    disabled
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '10px',
                      color: '#a5b4fc',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      cursor: 'not-allowed',
                    }}
                  />
                </div>

                <div style={{ textAlign: 'left', marginBottom: '14px' }}>
                  <label style={{ color: '#c7d2fe', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={userPhone}
                    disabled
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '10px',
                      color: '#a5b4fc',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      cursor: 'not-allowed',
                    }}
                  />
                </div>

                <div style={{ textAlign: 'left', marginBottom: '14px' }}>
                  <label style={{ color: '#c7d2fe', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                    Reason for Reactivation *
                  </label>
                  <textarea
                    required
                    placeholder="Why do you want to reactivate your Sangha?"
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
                      resize: 'vertical',
                    }}
                    value={reactivationForm.reason}
                    onChange={(e) => setReactivationForm({ ...reactivationForm, reason: e.target.value })}
                  />
                </div>

                <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                  <label style={{ color: '#c7d2fe', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                    Additional Information (Optional)
                  </label>
                  <textarea
                    placeholder="Any extra details you want to share..."
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
                      minHeight: '60px',
                      resize: 'vertical',
                    }}
                    value={reactivationForm.additionalInfo}
                    onChange={(e) => setReactivationForm({ ...reactivationForm, additionalInfo: e.target.value })}
                  />
                </div>

                {reactivationError && (
                  <div style={{
                    color: '#f87171',
                    fontSize: '14px',
                    marginBottom: '14px',
                    padding: '12px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '8px',
                  }}>
                    ❌ {reactivationError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      flex: 1,
                      padding: '14px',
                      backgroundColor: '#22c55e',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: '600',
                      fontSize: '16px',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      opacity: submitting ? 0.5 : 1,
                    }}
                  >
                    {submitting ? 'Submitting...' : '📤 Submit Request'}
                  </button>
                  <button
                    onClick={() => {
                      setShowReactivationForm(false)
                      setReactivationForm({ reason: '', additionalInfo: '' })
                    }}
                    style={{
                      padding: '14px 24px',
                      background: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🚫</div>
              <h2 style={{ color: 'white', fontSize: '24px', marginBottom: '12px' }}>
                Sangha Deactivated
              </h2>
              <p style={{ color: '#fca5a5', fontSize: '16px', lineHeight: '1.6' }}>
                {deactivationMessage}
              </p>
              <p style={{ color: '#a5b4fc', fontSize: '14px', marginTop: '8px' }}>
                Sangha ID: <strong>{sanghaId}</strong>
              </p>
              <button
                onClick={() => {
                  setShowReactivationForm(true)
                  setReactivationError('')
                }}
                style={{
                  marginTop: '20px',
                  padding: '14px 32px',
                  backgroundColor: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  width: '100%',
                }}
              >
                📝 Request Reactivation
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('token')
                  localStorage.removeItem('user')
                  router.push('/login')
                }}
                style={{
                  marginTop: '12px',
                  padding: '12px 32px',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  width: '100%',
                }}
              >
                Go to Login
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e1b4b, #4c1d95, #9d174d)',
      display: 'flex',
      fontFamily: 'Arial, sans-serif',
    }}>
      <AdminSidebar />

      <div style={{
        flex: 1,
        padding: '32px 24px',
        overflowX: 'hidden',
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
              onClick={handleManualCheck}
              style={{
                padding: '8px 16px',
                backgroundColor: '#fbbf24',
                color: '#1e1b4b',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              🔍 Check Status
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
    </div>
  )
}