import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.split(' ')[1]

    console.log('🔍 ===== STATUS API CALLED =====')
    console.log('🔍 Token:', token ? 'Yes' : 'No')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    console.log('🔍 Decoded token:', decoded)

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = decoded.id || decoded.userId
    console.log('🔍 User ID from token:', userId)

    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        sangha: true,
        sanghaRequests: true,
      }
    })

    console.log('🔍 User found:', user ? 'Yes' : 'No')
    console.log('🔍 User isActive:', user?.isActive)
    console.log('🔍 Sangha isActive:', user?.sangha?.isActive)
    console.log('🔍 User phone from DB:', user?.phone)

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

    const responseData = {
      isProfileComplete: user.isProfileComplete || false,
      sanghaId: user.sangha?.sanghaId || null,
      hasPendingRequest: hasPendingRequest || false,
      isActive: user.isActive !== false,
      sanghaIsActive: user.sangha?.isActive ?? true,
      // ⭐⭐⭐ ADD USER DATA WITH PHONE ⭐⭐⭐
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '', // ⭐ PHONE IS HERE
        username: user.username,
      }
    }

    console.log('📤 Response data with phone:', responseData.user?.phone)

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error fetching admin status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}