import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.split(' ')[1]

    if (!token) {
      return NextResponse.json({ error: 'No token' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    
    return NextResponse.json({
      token: token.substring(0, 30) + '...',
      decoded: decoded,
      hasId: !!decoded?.id,
      hasUserId: !!decoded?.userId,
      hasEmail: !!decoded?.email,
      hasRole: !!decoded?.role,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}