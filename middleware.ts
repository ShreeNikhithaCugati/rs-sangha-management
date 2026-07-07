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
  const publicPaths = ['/login', '/signup', '/verify-otp']
  if (publicPaths.includes(path)) {
    return NextResponse.next()
  }

  // Only check dashboard routes
  if (!path.startsWith('/dashboard/')) {
    return NextResponse.next()
  }

  console.log('🔐 Checking auth for:', path)

  // ✅ Get token from cookie FIRST
  let token = request.cookies.get('token')?.value || null

  // ✅ If no cookie, check Authorization header (for localStorage users)
  if (!token) {
    const authHeader = request.headers.get('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7)
      console.log('🔑 Token found in Authorization header')
    }
  }

  // ✅ If still no token, redirect to login
  if (!token) {
    console.log('❌ No token found, redirecting to login')
    const response = NextResponse.redirect(new URL('/login', request.url))
    // Clear any invalid cookies
    response.cookies.delete('token')
    return response
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

  // Check role
  const userRole = decoded.role?.toUpperCase() || ''
  const pathLower = path.toLowerCase()

  console.log(`✅ User role: ${userRole}, accessing: ${path}`)

  // Role-based access control
  if (pathLower.startsWith('/dashboard/superadmin') && userRole !== 'SUPERADMIN') {
    console.log('❌ Access denied: Not SUPERADMIN')
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('token')
    return response
  }
  
  if (pathLower.startsWith('/dashboard/admin') && userRole !== 'ADMIN') {
    console.log('❌ Access denied: Not ADMIN')
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('token')
    return response
  }

  if (pathLower.startsWith('/dashboard/member') && userRole !== 'MEMBER') {
    console.log('❌ Access denied: Not MEMBER')
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('token')
    return response
  }

  console.log('✅ Access granted for:', path)
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*']
}