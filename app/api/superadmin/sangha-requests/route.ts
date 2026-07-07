import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // ✅ CORRECT: sanghaRequest (with 'g')
    const requests = await prisma.sanghaRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(requests)
  } catch (error) {
    console.error('Error fetching sangha requests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}