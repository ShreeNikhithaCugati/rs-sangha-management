'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'MEMBER'
  })
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const roles = [
    { value: 'SUPERADMIN', label: 'Super Admin' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'MEMBER', label: 'Member' }
  ]

  const validatePassword = (password: string) => {
    const errors: string[] = []
    if (password.length > 0 && password.length < 6) {
      errors.push('Password must be at least 6 characters long')
    }
    return errors
  }

  const [passwordErrors, setPasswordErrors] = useState<string[]>([])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (name === 'password') {
      setPasswordErrors(validatePassword(value))
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    alert('60');
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setLoading(true)

    const errors = validatePassword(formData.password)
    if (errors.length > 0) {
      setError('Please fix password issues before continuing')
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: formData.role
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed')
      }

      setSuccessMessage(`✅ Account created successfully! Please check your email for OTP verification.`)
      setStep(2)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    alert('30');
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'OTP verification failed')
      }

      setSuccessMessage(`✅ Email verified successfully! Redirecting...`)

      document.cookie = `token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}`
      
      // ✅ FIX: Use redirectUrl from API
      setTimeout(() => {
        alert('useRedirect');
        const redirectUrl = data.redirectUrl || '/dashboard'
        router.push(redirectUrl)
      }, 1500)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  // OTP Verification Step
  if (step === 2) {
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
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'white', marginBottom: '6px' }}>
              Verify Your Email
            </h2>
            <p style={{ fontSize: '14px', color: '#a5b4fc' }}>
              We sent a verification code to<br />
              <span style={{ fontWeight: '600', color: 'white' }}>{formData.email}</span>
            </p>
          </div>

          {successMessage && (
            <div style={{
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(74, 222, 128, 0.3)',
              color: '#86efac',
              padding: '12px 16px',
              borderRadius: '10px',
              fontSize: '14px',
              marginBottom: '20px',
              textAlign: 'center',
            }}>
              {successMessage}
            </div>
          )}

          <form onSubmit={handleVerifyOTP}>
            <div>
              <input
                type="text"
                required
                style={{
                  width: '100%',
                  padding: '14px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'white',
                  borderRadius: '10px',
                  fontSize: '24px',
                  textAlign: 'center',
                  letterSpacing: '10px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                }}
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
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

            {error && (
              <div style={{ color: '#f87171', fontSize: '14px', textAlign: 'center', marginTop: '16px' }}>
                {error}
              </div>
            )}

            <button
              type="button"
              disabled={loading}
              onClick={(e) => {alert('verify OTP from signup'); handleVerifyOTP(e)}}
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
                marginTop: '24px',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e0e7ff'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#a5b4fc',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'color 0.3s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#a5b4fc'}
              >
                ← Back to signup
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Signup Form
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
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: 'white',
            marginBottom: '4px',
            letterSpacing: '-0.5px',
          }}>
            Create Account
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#a5b4fc',
          }}>
            Join RS Associates Sangha Management
          </p>
        </div>

        {successMessage && (
          <div style={{
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(74, 222, 128, 0.3)',
            color: '#86efac',
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '14px',
            marginBottom: '20px',
            textAlign: 'center',
          }}>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSignup}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Username */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: '#c7d2fe',
                marginBottom: '4px',
                letterSpacing: '0.3px',
              }}>
                Username *
              </label>
              <input
                type="text"
                name="username"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'white',
                  borderRadius: '10px',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                }}
                placeholder="Choose a unique username"
                value={formData.username}
                onChange={handleChange}
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

            {/* Full Name */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: '#c7d2fe',
                marginBottom: '4px',
                letterSpacing: '0.3px',
              }}>
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'white',
                  borderRadius: '10px',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                }}
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
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

            {/* Email */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: '#c7d2fe',
                marginBottom: '4px',
                letterSpacing: '0.3px',
              }}>
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'white',
                  borderRadius: '10px',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                }}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
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

            {/* Phone */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: '#c7d2fe',
                marginBottom: '4px',
                letterSpacing: '0.3px',
              }}>
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'white',
                  borderRadius: '10px',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                }}
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
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

            {/* Password */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: '#c7d2fe',
                marginBottom: '4px',
                letterSpacing: '0.3px',
              }}>
                Password *
              </label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'white',
                  borderRadius: '10px',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                }}
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#818cf8'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                }}
              />
              <p style={{
                fontSize: '12px',
                marginTop: '4px',
                color: formData.password.length >= 6 ? '#86efac' : '#a5b4fc',
              }}>
                {formData.password.length >= 6 ? '✅' : '⬜'} Minimum 6 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: '#c7d2fe',
                marginBottom: '4px',
                letterSpacing: '0.3px',
              }}>
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'white',
                  borderRadius: '10px',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                }}
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#818cf8'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                }}
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p style={{ fontSize: '12px', color: '#f87171', marginTop: '4px' }}>❌ Passwords do not match</p>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <p style={{ fontSize: '12px', color: '#86efac', marginTop: '4px' }}>✅ Passwords match</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: '#c7d2fe',
                marginBottom: '4px',
                letterSpacing: '0.3px',
              }}>
                Role *
              </label>
              <select
                name="role"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'white',
                  borderRadius: '10px',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                }}
                value={formData.role}
                onChange={handleChange}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#818cf8'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                }}
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value} style={{ color: '#1e1b4b' }}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div style={{
              color: '#f87171',
              fontSize: '14px',
              textAlign: 'center',
              marginTop: '18px',
            }}>
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={(e) => {alert('30'); handleSignup(e);}}
            disabled={loading}
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
              marginTop: '24px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e0e7ff'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)'
            }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <div style={{
            textAlign: 'center',
            marginTop: '16px',
          }}>
            <a href="/login" style={{
              color: '#a5b4fc',
              fontSize: '14px',
              textDecoration: 'none',
              transition: 'color 0.3s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#a5b4fc'}
            >
              Already have an account? Sign in
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}