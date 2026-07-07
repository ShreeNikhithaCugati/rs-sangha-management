import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
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
      where: { id: decoded.userId }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only Admins can submit this request' }, { status: 403 })
    }

    const {
      sanghaName, state, country, city, district, town, village, address,
      adminName, adminEmail, adminPhone, adminAddress, aadharNumber, photo
    } = await request.json()

    // Check if already has pending request
    const existingRequest = await prisma.sanghaRequest.findFirst({
      where: {
        adminId: decoded.userId,
        status: 'PENDING'
      }
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending Sangha creation request.' },
        { status: 400 }
      )
    }

    const sanghaRequest = await prisma.sanghaRequest.create({
      data: {
        adminId: decoded.userId,
        sanghaName,
        state,
        country,
        city,
        district,
        town: town || null,
        village: village || null,
        address,
        adminName,
        adminEmail,
        adminPhone,
        adminAddress,
        aadharNumber,
        photo: photo || null,
        status: 'PENDING',
      },
    })

    return NextResponse.json({
      message: 'Request submitted successfully',
      requestId: sanghaRequest.id,
    })
  } catch (error) {
    console.error('Error creating sangha request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}