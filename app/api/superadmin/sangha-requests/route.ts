import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.split(' ')[1]

    console.log('🔑 Auth header:', authHeader ? 'Present' : 'Missing')
    console.log('🔑 Token:', token ? token.substring(0, 20) + '...' : 'Missing')

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      )
    }

    const decoded = await verifyToken(token)
    console.log('👤 Decoded user:', decoded)

    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      )
    }

    if (decoded.role !== 'SUPERADMIN') {
      console.log('❌ User role is not SUPERADMIN:', decoded.role)
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      )
    }

    const requests = await prisma.sanghaRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`✅ Found ${requests.length} pending requests`)
    return NextResponse.json(requests)
  } catch (error) {
    console.error('Error fetching sangha requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.split(' ')[1]

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      )
    }

    const decoded = await verifyToken(token)
    if (!decoded || decoded.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await req.json()
    
    const request = await prisma.sanghaRequest.create({
      data: {
        sanghaName: body.sanghaName,
        state: body.state,
        country: body.country,
        city: body.city,
        district: body.district,
        address: body.address,
        adminName: body.adminName,
        adminEmail: body.adminEmail,
        adminPhone: body.adminPhone,
        adminAddress: body.adminAddress,
        aadharNumber: body.aadharNumber,
        adminId: body.adminId,
        status: 'PENDING'
      }
    })

    return NextResponse.json(request, { status: 201 })
  } catch (error) {
    console.error('Error creating sangha request:', error)
    return NextResponse.json(
      { error: 'Failed to create request' },
      { status: 500 }
    )
  }
}