// app/api/auth/check/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  
  console.log('🔍 Auth Check:')
  console.log('  Token exists:', !!token)
  
  if (!token) {
    return NextResponse.json({ authenticated: false })
  }

  const decoded = verifyToken(token)
  
  if (!decoded) {
    console.log('❌ Invalid token')
    return NextResponse.json({ authenticated: false })
  }

  console.log('✅ Token valid for user:', decoded)
  return NextResponse.json({ 
    authenticated: true,
    user: decoded 
  })
}