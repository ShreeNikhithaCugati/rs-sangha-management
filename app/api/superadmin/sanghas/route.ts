import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma' // ✅ Already using prisma, this is correct!
import { verifyToken } from '@/lib/auth'


export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded || decoded.role?.toUpperCase() !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const sanghas = await prisma.sangha.findMany({
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        _count: {
          select: {
            members: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const sanghasWithCount = sanghas.map(sangha => ({
      ...sangha,
      membersCount: sangha._count.members
    }))

    return NextResponse.json({
      success: true,
      data: sanghasWithCount
    })
    
  } catch (error) {
    console.error('Error fetching sanghas:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      data: []
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded || decoded.role?.toUpperCase() !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { sanghaId, name, address, date, time } = await request.json()

    // Check if sanghaId already exists
    const existingSanghaId = await prisma.sangha.findUnique({
      where: { sanghaId }
    })
    if (existingSanghaId) {
      return NextResponse.json({ error: 'Sangha ID already exists' }, { status: 400 })
    }

    // Check if name already exists
    const existingName = await prisma.sangha.findUnique({
      where: { name }
    })
    if (existingName) {
      return NextResponse.json({ error: 'Sangha name already exists' }, { status: 400 })
    }

    const dateTime = date && time ? new Date(`${date}T${time}:00`) : new Date()

    const sangha = await prisma.sangha.create({
      data: {
        sanghaId,
        name,
        code: name.substring(0, 3).toUpperCase(),
        address: address || '',
        date: dateTime,
        isActive: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Sangha created successfully',
      sangha,
    })
  } catch (error) {
    console.error('Error creating sangha:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error' 
    }, { status: 500 })
  }
}