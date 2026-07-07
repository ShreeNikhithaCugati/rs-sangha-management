import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { sanghaId, username } = await request.json()

    if (!sanghaId || !username) {
      return NextResponse.json(
        { error: 'Sangha ID and Username are required' },
        { status: 400 }
      )
    }

    // Find the Sangha
    const sangha = await prisma.sangha.findUnique({
      where: { sanghaId: sanghaId.toUpperCase() },
      include: { admin: true }
    })

    if (!sangha) {
      return NextResponse.json(
        { error: 'Invalid Sangha ID. Please check with Super Admin.' },
        { status: 404 }
      )
    }

    // Check if Sangha has an admin
    if (!sangha.admin) {
      return NextResponse.json(
        { error: 'No admin assigned to this Sangha. Contact Super Admin.' },
        { status: 400 }
      )
    }

    // Verify username matches the admin
    if (sangha.admin.username !== username) {
      return NextResponse.json(
        { error: 'Username does not match the admin for this Sangha.' },
        { status: 400 }
      )
    }

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update user with sanghaId and mark profile complete
    await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        sanghaId: sangha.id,
        isProfileComplete: true,
      },
    })

    return NextResponse.json({
      message: 'Verification successful!',
      sanghaId: sangha.sanghaId,
    })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}