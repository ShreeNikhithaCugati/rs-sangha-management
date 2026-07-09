'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'

export default function AdminSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { 
      name: 'Dashboard', 
      path: '/dashboard/admin', 
      icon: '📊' 
    },
    { 
      name: 'Create Members', 
      path: '/dashboard/admin/create-members', 
      icon: '👤' 
    },
    { 
      name: 'Members List', 
      path: '/dashboard/admin/members', 
      icon: '📋' 
    },
    { 
      name: 'Ledger', 
      path: '/dashboard/admin/ledger', 
      icon: '📒' 
    },
    { 
      name: 'Savings', 
      path: '/dashboard/admin/savings', 
      icon: '💰' 
    }
  ]

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/')
  }

  return (
    <>
      {/* Mobile Hamburger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 1000,
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '10px',
          padding: '10px 14px',
          cursor: 'pointer',
          color: 'white',
          fontSize: '24px',
          display: 'none',
        }}
        className="md:hidden"
      >
        ☰
      </button>

      {/* Sidebar */}
      <div style={{
        width: '280px',
        minHeight: '100vh',
        background: 'rgba(30, 27, 75, 0.95)',
        backdropFilter: 'blur(12px)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
        transition: 'all 0.3s ease',
        zIndex: 100,
        flexShrink: 0,
      }}
      className={isOpen ? 'sidebar-open' : ''}
      >
        {/* Logo / Brand */}
        <div style={{
          padding: '28px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          textAlign: 'center',
        }}>
          <h1 style={{
            color: 'white',
            fontSize: '22px',
            fontWeight: '700',
            margin: 0,
            letterSpacing: '-0.5px',
          }}>
            🏛️ RS Associates
          </h1>
          <p style={{
            color: '#a5b4fc',
            fontSize: '12px',
            margin: '4px 0 0 0',
            letterSpacing: '0.5px',
          }}>
            Admin Panel
          </p>
        </div>

        {/* Navigation Menu */}
        <nav style={{
          flex: 1,
          padding: '16px 12px',
        }}>
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                router.push(item.path)
                setIsOpen(false)
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 16px',
                marginBottom: '4px',
                background: isActive(item.path) ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                border: 'none',
                borderRadius: '10px',
                color: isActive(item.path) ? 'white' : '#a5b4fc',
                fontSize: '15px',
                fontWeight: isActive(item.path) ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                  e.currentTarget.style.color = 'white'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#a5b4fc'
                }
              }}
            >
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              <span>{item.name}</span>
              {isActive(item.path) && (
                <span style={{
                  marginLeft: 'auto',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#818cf8',
                }} />
              )}
            </button>
          ))}
        </nav>

        {/* Bottom Section - Logout */}
        <div style={{
          padding: '16px 12px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '10px',
              color: '#fca5a5',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
            }}
          >
            <span style={{ fontSize: '20px' }}>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 99,
            display: 'none',
          }}
          className="md:hidden"
        />
      )}

      {/* Mobile responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .md\\:hidden {
            display: block !important;
          }
          .sidebar-open {
            transform: translateX(0) !important;
          }
          div[style*="position: sticky"] {
            transform: translateX(-100%);
            position: fixed !important;
            width: 280px !important;
          }
          .sidebar-open + div {
            display: block !important;
          }
        }
        @media (min-width: 769px) {
          .md\\:hidden {
            display: none !important;
          }
          div[style*="position: sticky"] {
            transform: translateX(0) !important;
            position: sticky !important;
          }
        }
      `}</style>
    </>
  )
}