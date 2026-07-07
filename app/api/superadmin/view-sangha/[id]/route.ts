import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const sangha = await prisma.sangha.findUnique({
      where: { id: params.id },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            phone: true,
          }
        },
        members: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!sangha) {
      return NextResponse.json({ error: 'Sangha not found' }, { status: 404 })
    }

    return NextResponse.json(sangha)
  } catch (error) {
    console.error('Error fetching sangha:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}