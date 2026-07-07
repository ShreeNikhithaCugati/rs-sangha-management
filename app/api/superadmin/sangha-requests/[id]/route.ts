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

    // ✅ CORRECT: sanghaRequest (with 'g')
    const sanghaRequest = await prisma.sanghaRequest.findUnique({
      where: { id: params.id },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
          }
        }
      }
    })

    if (!sanghaRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    return NextResponse.json(sanghaRequest)
  } catch (error) {
    console.error('Error fetching sangha request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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

    const { action, sanghaId, rejectedReason } = await request.json()
    const requestId = params.id

    // ✅ CORRECT: sanghaRequest (with 'g')
    const sanghaRequest = await prisma.sanghaRequest.findUnique({
      where: { id: requestId },
      include: { admin: true }
    })

    if (!sanghaRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (action === 'approve') {
      const finalSanghaId = sanghaId || `RSB${String(Date.now()).slice(-4)}`

      const sangha = await prisma.sangha.create({
        data: {
          sanghaId: finalSanghaId,
          name: sanghaRequest.sanghaName,
          code: sanghaRequest.sanghaName.substring(0, 3).toUpperCase(),
          state: sanghaRequest.state,
          country: sanghaRequest.country,
          city: sanghaRequest.city,
          district: sanghaRequest.district,
          town: sanghaRequest.town,
          village: sanghaRequest.village,
          address: sanghaRequest.address,
          isActive: true,
        },
      })

      await prisma.user.update({
        where: { id: sanghaRequest.adminId },
        data: {
          sanghaId: sangha.id,
          isProfileComplete: true,
          role: 'ADMIN',
        },
      })

      // ✅ CORRECT: sanghaRequest (with 'g')
      await prisma.sanghaRequest.update({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          assignedSanghaId: finalSanghaId,
          reviewedAt: new Date(),
          reviewedBy: decoded.userId,
        },
      })

      return NextResponse.json({
        message: 'Sangha created and admin notified!',
        sanghaId: finalSanghaId,
      })
    }

    if (action === 'reject') {
      // ✅ CORRECT: sanghaRequest (with 'g')
      await prisma.sanghaRequest.update({
        where: { id: requestId },
        data: {
          status: 'REJECTED',
          rejectedReason: rejectedReason || 'Your request was not approved at this time.',
          reviewedAt: new Date(),
          reviewedBy: decoded.userId,
        },
      })

      return NextResponse.json({
        message: 'Request rejected and admin notified!',
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error processing request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}