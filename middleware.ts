// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Skip API routes
  if (path.startsWith('/api/')) {
    return NextResponse.next()
  }
  
  // Public paths
  const publicPaths = ['/login', '/signup', '/verify-otp', '/']
  if (publicPaths.includes(path)) {
    return NextResponse.next()
  }

  console.log('🔐 Middleware - Checking auth for:', path)

  // ✅ Check BOTH: Authorization header AND cookie
  let token = null
  
  // 1. Check Authorization header
  const authHeader = request.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7)
    console.log('🔑 Token found in Authorization header')
  }
  
  // 2. If no header, check cookie
  if (!token) {
    token = request.cookies.get('token')?.value || null
    if (token) {
      console.log('🔑 Token found in cookie')
    }
  }

  console.log('🔑 Token found:', token ? 'Yes' : 'No')

  // If no token, redirect to login
  if (!token) {
    console.log('❌ Middleware - No token found, redirecting to login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  console.log('🔑 Middleware - Token found, verifying...')

  // Verify token
  const decoded = await verifyToken(token)
  
  if (!decoded) {
    console.log('❌ Middleware - Invalid token, redirecting to login')
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('token')
    return response
  }

  const userRole = decoded.role?.toUpperCase() || ''
  const pathLower = path.toLowerCase()

  console.log(`✅ Middleware - User role: ${userRole}, accessing: ${path}`)

  // Allow admin to access submit form
  if (pathLower === '/admin/submit-form') {
    if (userRole === 'ADMIN' || userRole === 'SUPERADMIN') {
      console.log('✅ Middleware - Admin accessing submit form - allowed')
      return NextResponse.next()
    } else {
      console.log('❌ Middleware - Access denied: Not ADMIN or SUPERADMIN')
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Role-based access control for dashboard
  if (pathLower.startsWith('/dashboard/superadmin') && userRole !== 'SUPERADMIN') {
    console.log('❌ Middleware - Access denied: Not SUPERADMIN')
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  if (pathLower.startsWith('/dashboard/admin') && userRole !== 'ADMIN') {
    console.log('❌ Middleware - Access denied: Not ADMIN')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (pathLower.startsWith('/dashboard/member') && userRole !== 'MEMBER') {
    console.log('❌ Middleware - Access denied: Not MEMBER')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  console.log('✅ Middleware - Access granted for:', path)
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*']
}