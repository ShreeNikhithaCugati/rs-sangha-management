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
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const admin = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { sangha: true }
    })

    if (!admin || !admin.sangha) {
      return NextResponse.json([])
    }

    // ✅ Check if Sangha is active
    if (!admin.sangha.isActive) {
      return NextResponse.json(
        { error: 'Sangha is deactivated. Please contact Super Admin.' },
        { status: 403 }
      )
    }

    const members = await prisma.member.findMany({
      where: { sanghaId: admin.sangha.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { name, email, phone, address } = await request.json()

    const admin = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { sangha: true }
    })

    if (!admin || !admin.sangha) {
      return NextResponse.json({ error: 'Admin has no Sangha' }, { status: 400 })
    }

    // ✅ Check if Sangha is active
    if (!admin.sangha.isActive) {
      return NextResponse.json(
        { error: 'Cannot add members. Sangha is deactivated.' },
        { status: 403 }
      )
    }

    // Check if member already exists
    const existingMember = await prisma.member.findUnique({
      where: { email }
    })
    if (existingMember) {
      return NextResponse.json({ error: 'Member already exists' }, { status: 400 })
    }

    // Check member count (max 20 per sangha)
    const memberCount = await prisma.member.count({
      where: { sanghaId: admin.sangha.id }
    })

    if (memberCount >= 20) {
      return NextResponse.json({ error: 'Member limit reached (max 20)' }, { status: 400 })
    }

    const member = await prisma.member.create({
      data: {
        name,
        email,
        phone,
        address,
        sanghaId: admin.sangha.id,
        adminId: admin.id,
      },
    })

    await prisma.sangha.update({
      where: { id: admin.sangha.id },
      data: { membersCount: { increment: 1 } }
    })

    return NextResponse.json({
      message: 'Member added successfully',
      member
    })
  } catch (error) {
    console.error('Error adding member:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}