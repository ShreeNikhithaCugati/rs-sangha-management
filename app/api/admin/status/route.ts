import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.split(' ')[1]

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        sangha: true,
        sanghaRequests: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let hasPendingRequest = false
    if (user.sanghaRequests && user.sanghaRequests.length > 0) {
      for (const req of user.sanghaRequests) {
        if (req.status === 'PENDING') {
          hasPendingRequest = true
          break
        }
      }
    }

    return NextResponse.json({
      isProfileComplete: user.isProfileComplete || false,
      sanghaId: user.sangha?.sanghaId || null,
      hasPendingRequest: hasPendingRequest || false,
    })
  } catch (error) {
    console.error('Error fetching admin status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}