//app/dashboard/superadmin/sanghas/[id]/toggle-status/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('token')?.value
    console.log('🔍 Token received:', token ? 'Yes' : 'No')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    console.log('🔍 Decoded token:', decoded)

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (decoded.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Forbidden - Not Super Admin' }, { status: 403 })
    }

    const { isActive } = await request.json()
    const sanghaId = params.id

    console.log('🔄 Updating sangha:', { sanghaId, isActive })

    const sangha = await prisma.sangha.update({
      where: { id: sanghaId },
      data: { isActive },
    })

    console.log('✅ Sangha updated:', sangha)

    return NextResponse.json({
      message: `Sangha ${isActive ? 'activated' : 'deactivated'} successfully`,
      sangha,
    })
  } catch (error) {
    console.error('❌ Error toggling sangha status:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}