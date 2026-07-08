import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ⭐ FIX: Get token from Authorization header, not cookies
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.split(' ')[1]
    
    console.log('🔍 Token received:', token ? 'Yes' : 'No')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    console.log('🔍 Decoded token:', decoded)

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (decoded.role !== 'SUPERADMIN') {
      console.log('❌ User role is not SUPERADMIN:', decoded.role)
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 })
    }

    const { isActive } = await request.json()
    const sanghaId = params.id

    console.log('🔄 Updating sangha:', { sanghaId, isActive })

    // Check if sangha exists
    const existingSangha = await prisma.sangha.findUnique({
      where: { id: sanghaId }
    })

    if (!existingSangha) {
      return NextResponse.json({ error: 'Sangha not found' }, { status: 404 })
    }

    const sangha = await prisma.sangha.update({
      where: { id: sanghaId },
      data: { isActive },
    })

    console.log('✅ Sangha updated:', sangha)

    return NextResponse.json({
      success: true,
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