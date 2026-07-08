import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.split(' ')[1]

    console.log('🔑 ===== START =====')
    console.log('🔑 Token received:', token ? 'Yes' : 'No')

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      )
    }

    // ⭐ Verify token
    const decoded = await verifyToken(token)
    console.log('👤 Decoded user:', decoded)

    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // ⭐⭐ FIX: Try different field names
    const userId = decoded.id || decoded.userId || decoded.sub
    
    console.log('👤 User ID from token:', userId)
    console.log('👤 User email from token:', decoded.email)

    if (!userId) {
      console.log('❌ No user ID found in token')
      return NextResponse.json(
        { error: 'Invalid token - missing user ID' },
        { status: 401 }
      )
    }

    // ⭐ Find user by ID or email
    let user = await prisma.user.findUnique({
      where: { id: userId }
    })

    // ⭐ If not found by ID, try by email
    if (!user && decoded.email) {
      console.log('👤 Trying to find user by email:', decoded.email)
      user = await prisma.user.findUnique({
        where: { email: decoded.email }
      })
    }

    if (!user) {
      console.log('❌ User not found in database')
      return NextResponse.json(
        { error: 'User not found. Please login again.' },
        { status: 404 }
      )
    }

    console.log('👤 User found:', user.id, user.role, user.email)

    // ⭐ Check role
    const userRole = user.role?.toUpperCase()
    if (userRole !== 'ADMIN' && userRole !== 'SUPERADMIN') {
      console.log('❌ User role is not ADMIN or SUPERADMIN:', user.role)
      return NextResponse.json(
        { error: 'Forbidden - Only Admins can submit requests' },
        { status: 403 }
      )
    }

    // ⭐ Get request body
    const body = await request.json()
    console.log('📝 Request body:', body)

    const {
      sanghaName,
      state,
      country,
      city,
      district,
      town,
      village,
      address,
      adminName,
      adminEmail,
      adminPhone,
      adminAddress,
      aadharNumber,
      photo,
    } = body

    // ⭐ Validate required fields
    if (!sanghaName || !state || !country || !city || !district || !address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // ⭐ Create SanghaRequest
    const sanghaRequest = await prisma.sanghaRequest.create({
      data: {
        sanghaName,
        state,
        country,
        city,
        district,
        town: town || null,
        village: village || null,
        address,
        adminName: adminName || user.name,
        adminEmail: adminEmail || user.email,
        adminPhone: adminPhone || user.phone || '',
        adminAddress: adminAddress || user.address || '',
        aadharNumber: aadharNumber || user.aadharNumber || '',
        photo: photo || null,
        adminId: user.id, // ⭐ Use user.id from database
        status: 'PENDING',
      },
    })

    console.log('✅ SanghaRequest created:', sanghaRequest.id)

    return NextResponse.json({
      success: true,
      message: 'Sangha request submitted successfully',
      data: sanghaRequest,
    })

  } catch (error) {
    console.error('❌ Error creating sangha request:', error)
    return NextResponse.json(
      { error: 'Failed to submit request: ' + (error as Error).message },
      { status: 500 }
    )
  }
}