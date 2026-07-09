import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.split(' ')[1]

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = await verifyToken(token)
    if (!decoded || decoded.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Only Super Admin can create sanghas' },
        { status: 403 }
      )
    }

    const { name, address, state, country, city, district, town, village } = await request.json()

    // Validate required fields
    if (!name || !state || !country || !city || !district) {
      return NextResponse.json(
        { error: 'Name, state, country, city, and district are required' },
        { status: 400 }
      )
    }

    // Generate unique IDs
    const sanghaId = `RS${Date.now().toString().slice(-6)}`
    const code = name.substring(0, 3).toUpperCase()

    // Check if code already exists and make it unique
    let uniqueCode = code
    let counter = 1
    let existingSangha = await prisma.sangha.findUnique({
      where: { code: uniqueCode }
    })
    
    while (existingSangha) {
      uniqueCode = `${code}${counter}`
      counter++
      existingSangha = await prisma.sangha.findUnique({
        where: { code: uniqueCode }
      })
    }

    // Create Sangha
    const sangha = await prisma.sangha.create({
      data: {
        sanghaId,
        name,
        code: uniqueCode,
        address: address || '',
        state,
        country,
        city,
        district,
        town: town || null,
        village: village || null,
        isActive: true,
        membersCount: 0,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Sangha created successfully',
      sangha: {
        id: sangha.id,
        sanghaId: sangha.sanghaId,
        name: sangha.name,
        code: sangha.code,
        address: sangha.address,
      },
    })

  } catch (error) {
    console.error('Create sangha error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}