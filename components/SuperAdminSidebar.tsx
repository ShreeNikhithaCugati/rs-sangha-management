'use client'

import { useRouter, usePathname } from 'next/navigation'

export default function SuperAdminSidebar() {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const menuItems = [
    { id: 'dashboard', label: '📊 Dashboard', path: '/dashboard/superadmin' },
    { id: 'sanghas', label: '🏛️ View All Sanghas', path: '/dashboard/superadmin/sanghas' },
    { id: 'create-sangha', label: '➕ Create Sangha', path: '/dashboard/superadmin/create-sangha' },
    { id: 'create-admin', label: '👤 Create Admin', path: '/dashboard/superadmin/create-admin' },
    { id: 'requests', label: '📋 Sangha Requests', path: '/dashboard/superadmin/requests' },
  ]

  const isActive = (path: string) => pathname === path

  return (
    <div style={{
      width: '250px',
      background: 'rgba(0,0,0,0.3)',
      padding: '24px 16px',
      minHeight: '100vh',
      borderRight: '1px solid rgba(255,255,255,0.1)',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflowY: 'auto'
    }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '700' }}>👑 Admin</h2>
        <p style={{ color: '#a5b4fc', fontSize: '12px' }}>Super Admin Panel</p>
      </div>

      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => router.push(item.path)}
          style={{
            display: 'block',
            width: '100%',
            padding: '12px 16px',
            marginBottom: '4px',
            background: isActive(item.path) ? 'rgba(255,255,255,0.1)' : 'transparent',
            border: 'none',
            borderRadius: '10px',
            color: isActive(item.path) ? 'white' : '#a5b4fc',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: isActive(item.path) ? '600' : '400',
            textAlign: 'left',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            if (!isActive(item.path)) {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive(item.path)) {
              e.currentTarget.style.background = 'transparent'
            }
          }}
        >
          {item.label}
        </button>
      ))}

      {/* Divider */}
      <div style={{
        height: '1px',
        background: 'rgba(255,255,255,0.1)',
        margin: '16px 0'
      }} />

      <button
        onClick={handleLogout}
        style={{
          display: 'block',
          width: '100%',
          padding: '12px 16px',
          marginTop: '8px',
          background: 'rgba(239, 68, 68, 0.2)',
          border: 'none',
          borderRadius: '10px',
          color: '#fca5a5',
          cursor: 'pointer',
          fontSize: '14px',
          textAlign: 'left',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.4)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
      >
        🚪 Logout
      </button>
    </div>
  )
}