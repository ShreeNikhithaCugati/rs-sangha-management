// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // ✅ Skip API routes
  if (path.startsWith('/api/')) {
    return NextResponse.next()
  }
  
  // ✅ Public paths (no auth needed)
  const publicPaths = ['/login', '/signup', '/verify-otp', '/']
  if (publicPaths.includes(path)) {
    return NextResponse.next()
  }

  console.log('🔐 Checking auth for:', path)

  // ✅ Get token from cookie
  const token = request.cookies.get('token')?.value || null

  console.log('🔑 Token from cookie:', token ? 'Yes (' + token.substring(0, 20) + '...)' : 'No')

  // ✅ If no token, redirect to login
  if (!token) {
    console.log('❌ No token found, redirecting to login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  console.log('🔑 Token found, verifying...')

  // Verify token
  const decoded = await verifyToken(token)
  
  if (!decoded) {
    console.log('❌ Invalid token, redirecting to login')
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('token')
    return response
  }

  const userRole = decoded.role?.toUpperCase() || ''
  const pathLower = path.toLowerCase()

  console.log(`✅ User role: ${userRole}, accessing: ${path}`)

  // ✅ Allow admin to access submit form
  if (pathLower === '/admin/submit-form') {
    if (userRole === 'ADMIN' || userRole === 'SUPERADMIN') {
      console.log('✅ Admin accessing submit form - allowed')
      return NextResponse.next()
    } else {
      console.log('❌ Access denied: Not ADMIN or SUPERADMIN')
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Role-based access control for dashboard
  if (pathLower.startsWith('/dashboard/superadmin') && userRole !== 'SUPERADMIN') {
    console.log('❌ Access denied: Not SUPERADMIN')
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  if (pathLower.startsWith('/dashboard/admin') && userRole !== 'ADMIN') {
    console.log('❌ Access denied: Not ADMIN')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (pathLower.startsWith('/dashboard/member') && userRole !== 'MEMBER') {
    console.log('❌ Access denied: Not MEMBER')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  console.log('✅ Access granted for:', path)
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*']
}