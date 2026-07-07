'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    setTimeout(() => setShow(true), 500)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e1b4b, #4c1d95, #9d174d)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      fontFamily: 'Arial, sans-serif',
      position: 'relative',
    }}>
      {/* RS Logo */}
      <div style={{
        width: '128px',
        height: '128px',
        margin: '0 auto 24px',
        background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        transform: show ? 'scale(1)' : 'scale(0.5)',
        opacity: show ? 1 : 0,
        transition: 'all 1s ease',
      }}>
        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '36px' }}>RS</span>
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: '48px',
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        transform: show ? 'translateY(0)' : 'translateY(20px)',
        opacity: show ? 1 : 0,
        transition: 'all 1s ease 0.2s',
      }}>
        RS Associates
      </h1>

      {/* Subtitle */}
      <p style={{
        fontSize: '20px',
        color: '#a5b4fc',
        textAlign: 'center',
        transform: show ? 'translateY(0)' : 'translateY(20px)',
        opacity: show ? 1 : 0,
        transition: 'all 1s ease 0.4s',
      }}>
        Sangha Management System
      </p>

      {/* Line */}
      <div style={{
        width: '96px',
        height: '4px',
        background: '#818cf8',
        margin: '24px auto 0',
        borderRadius: '9999px',
        transform: show ? 'scaleX(1)' : 'scaleX(0)',
        opacity: show ? 1 : 0,
        transition: 'all 1s ease 0.6s',
      }} />

      {/* Buttons */}
      <div style={{
        marginTop: '48px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
        maxWidth: '300px',
        transform: show ? 'translateY(0)' : 'translateY(20px)',
        opacity: show ? 1 : 0,
        transition: 'all 1s ease 0.3s',
      }}>
        <Link 
          href="/login" 
          style={{
            backgroundColor: 'white',
            color: '#1e1b4b',
            padding: '12px 32px',
            borderRadius: '8px',
            fontWeight: '600',
            textDecoration: 'none',
            textAlign: 'center',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e0e7ff'
            e.currentTarget.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white'
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          Sign In
        </Link>
        <Link 
          href="/signup" 
          style={{
            backgroundColor: 'transparent',
            color: 'white',
            padding: '12px 32px',
            borderRadius: '8px',
            fontWeight: '600',
            textDecoration: 'none',
            textAlign: 'center',
            border: '2px solid white',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'
            e.currentTarget.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          Create Account
        </Link>
      </div>

      {/* Text */}
      <p style={{
        color: '#a5b4fc',
        fontSize: '14px',
        marginTop: '16px',
        transform: show ? 'translateY(0)' : 'translateY(20px)',
        opacity: show ? 1 : 0,
        transition: 'all 1s ease 0.3s',
      }}>
        New user? Create an account • Existing user? Sign in
      </p>

      {/* Footer */}
      <footer style={{
        position: 'absolute',
        bottom: '32px',
        color: 'rgba(165, 180, 252, 0.5)',
        fontSize: '14px',
      }}>
        <p>© 2026 RS Associates</p>
      </footer>
    </div>
  )
}