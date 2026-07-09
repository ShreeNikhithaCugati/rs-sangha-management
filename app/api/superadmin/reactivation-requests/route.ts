import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.split(' ')[1]

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      )
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    if (decoded.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Only Super Admin can view reactivation requests' },
        { status: 403 }
      )
    }

    // Get all reactivation requests with sangha details, ordered by newest first
    const requests = await prisma.sanghaReactivationRequest.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        sangha: {
          select: {
            id: true,
            sanghaId: true,
            name: true,
            isActive: true,
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: requests,
      count: requests.length
    })

  } catch (error) {
    console.error('❌ Error fetching reactivation requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reactivation requests' },
      { status: 500 }
    )
  }
}