import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function PATCH(
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

    const { isActive } = await request.json()
    const sanghaId = params.id

    const sangha = await prisma.sangha.update({
      where: { id: sanghaId },
      data: { isActive },
    })

    return NextResponse.json({
      message: `Sangha ${isActive ? 'activated' : 'deactivated'} successfully`,
      sangha,
    })
  } catch (error) {
    console.error('Error toggling sangha status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}