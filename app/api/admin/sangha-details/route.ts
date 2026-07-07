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
      }
    })

    if (!user || !user.sangha) {
      return NextResponse.json({ error: 'Sangha not found' }, { status: 404 })
    }

    return NextResponse.json(user.sangha)
  } catch (error) {
    console.error('Error fetching sangha details:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}