// app/verify-otp/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function VerifyOTPPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [debug, setDebug] = useState<any>(null)
  const [resendTimer, setResendTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)

  useEffect(() => {
    if (!email) {
      router.push('/signup')
    }
  }, [email, router])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (resendTimer > 0 && !canResend) {
      timer = setTimeout(() => {
        setResendTimer(prev => prev - 1)
      }, 1000)
    } else if (resendTimer === 0) {
      setCanResend(true)
    }
    return () => clearTimeout(timer)
  }, [resendTimer, canResend])

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      console.log('📤 Verifying OTP for:', email)
      console.log('📤 OTP:', otp)

      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      })

      const data = await response.json()
      console.log('📥 Response:', data)
      console.log('📥 Redirect URL from API:', data.redirectUrl)

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP')
      }

      setSuccess('✅ Email verified successfully!')
      setDebug(data)
      
      // ✅ Store token in localStorage
      if (data.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        console.log('✅ Token stored in localStorage')
      }
      
      // ✅ ✅ ✅ Use window.location.href for full page reload
      setTimeout(() => {
        if (data.redirectUrl) {
          console.log('🔄 Redirecting to:', data.redirectUrl)
          window.location.href = data.redirectUrl
        } else {
          console.log('🔄 No redirectUrl, going to login')
          window.location.href = '/login'
        }
      }, 1500)

    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      console.log('📤 Resending OTP to:', email)

      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      console.log('📥 Resend response:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend OTP')
      }

      if (data.debug?.otp) {
        setSuccess(`✅ New OTP sent! (Dev: ${data.debug.otp})`)
      } else {
        setSuccess('✅ New OTP sent to your email!')
      }
      
      setResendTimer(60)
      setCanResend(false)

    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const checkStoredOTP = async () => {
    try {
      const response = await fetch(`/api/auth/check-otp?email=${email}`)
      const data = await response.json()
      console.log('🔍 Stored OTP:', data)
      setDebug(data)
      if (data.otp) {
        alert(`✅ Stored OTP in database: ${data.otp}\nExpires: ${new Date(data.otpExpiry).toLocaleString()}`)
      } else {
        alert('❌ No OTP found in database for this email')
      }
    } catch (err) {
      console.error('Error checking OTP:', err)
      alert('❌ Error checking OTP')
    }
  }

  if (!email) {
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
        <div style={{ color: 'white', fontSize: '18px' }}>Loading...</div>
      </div>
    )
  }

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
        maxWidth: '420px',
        width: '100%',
        padding: '40px 36px',
        background: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.15)',
        boxShadow: '0 30px 60px -20px rgba(0,0,0,0.6)',
        textAlign: 'center',
      }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: 'white',
            marginBottom: '8px',
          }}>
            Verify Your Email
          </h2>
          <p style={{
            fontSize: '15px',
            color: '#a5b4fc',
          }}>
            We sent a verification code to
          </p>
          <p style={{
            fontSize: '16px',
            color: 'white',
            fontWeight: '500',
            marginTop: '4px',
          }}>
            {email}
          </p>
        </div>

        <form onSubmit={handleVerifyOTP}>
          <div style={{ marginBottom: '24px' }}>
            <input
              type="text"
              required
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              maxLength={6}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '24px',
                textAlign: 'center',
                letterSpacing: '8px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.06)',
                color: 'white',
                borderRadius: '10px',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#818cf8'
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
              }}
            />
          </div>

          {success && (
            <div style={{
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(74, 222, 128, 0.3)',
              color: '#86efac',
              padding: '12px',
              borderRadius: '10px',
              fontSize: '14px',
              marginBottom: '16px',
            }}>
              {success}
            </div>
          )}

          {error && (
            <div style={{
              color: '#f87171',
              fontSize: '14px',
              marginBottom: '16px',
              padding: '12px',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}>
              ❌ {error}
              {error === 'Invalid OTP' && (
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#9ca3af' }}>
                  💡 Tip: Make sure you're entering the 6-digit code exactly as shown in your email.
                  {process.env.NODE_ENV === 'development' && (
                    <div style={{ marginTop: '4px', color: '#fbbf24' }}>
                      🔧 Dev: Click "🔍 Debug: Check Stored OTP" below to see the correct OTP
                    </div>
                  )}
                </div>
              )}
              {error === 'OTP expired' && (
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#9ca3af' }}>
                  💡 Your OTP has expired. Click "Resend OTP" below to get a new one.
                </div>
              )}
              {error === 'No OTP found. Please request a new OTP.' && (
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#9ca3af' }}>
                  💡 No OTP found. Click "Resend OTP" below to get a new one.
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: 'white',
              color: '#1e1b4b',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              opacity: (loading || otp.length !== 6) ? 0.5 : 1,
            }}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <div style={{ marginTop: '20px' }}>
          <button
            onClick={handleResendOTP}
            disabled={!canResend || loading}
            style={{
              background: 'none',
              border: 'none',
              color: canResend ? '#a5b4fc' : '#4b5563',
              fontSize: '14px',
              cursor: canResend ? 'pointer' : 'not-allowed',
              transition: 'color 0.3s ease',
            }}
          >
            {canResend ? 'Resend OTP' : `Resend in ${resendTimer}s`}
          </button>
        </div>

        <div style={{ marginTop: '16px' }}>
          <button
            onClick={() => router.push('/signup')}
            style={{
              background: 'none',
              border: 'none',
              color: '#6b7280',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'color 0.3s ease',
            }}
          >
            ← Back to signup
          </button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div style={{ 
            marginTop: '20px', 
            padding: '12px', 
            background: 'rgba(255,255,255,0.05)', 
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <button
              onClick={checkStoredOTP}
              style={{
                background: 'none',
                border: '1px solid #4b5563',
                color: '#9ca3af',
                padding: '5px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#818cf8'
                e.currentTarget.style.color = 'white'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#4b5563'
                e.currentTarget.style.color = '#9ca3af'
              }}
            >
              🔍 Debug: Check Stored OTP
            </button>
            {debug && (
              <pre style={{ 
                color: '#9ca3af', 
                fontSize: '11px', 
                marginTop: '10px', 
                textAlign: 'left',
                padding: '8px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '4px',
                overflow: 'auto',
                maxHeight: '150px'
              }}>
                {JSON.stringify(debug, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  )
}