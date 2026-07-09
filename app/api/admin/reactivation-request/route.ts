import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { sendReactivationRequestEmail } from '@/lib/email' // ⭐ ADD THIS

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
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const userId = decoded.id || decoded.userId
    
    // ⭐ Parse the request body
    let body
    try {
      body = await request.json()
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const { sanghaId, adminName, adminEmail, adminPhone, reason, additionalInfo } = body

    console.log('📝 Reactivation request data:', {
      sanghaId,
      adminName,
      adminEmail,
      adminPhone,
      reason,
      additionalInfo,
      userId
    })

    // ⭐ Validate required fields
    if (!sanghaId) {
      return NextResponse.json(
        { error: 'Sangha ID is required' },
        { status: 400 }
      )
    }

    if (!adminName) {
      return NextResponse.json(
        { error: 'Admin Name is required' },
        { status: 400 }
      )
    }

    if (!adminEmail) {
      return NextResponse.json(
        { error: 'Admin Email is required' },
        { status: 400 }
      )
    }

    if (!reason) {
      return NextResponse.json(
        { error: 'Reason for reactivation is required' },
        { status: 400 }
      )
    }

    // ⭐ Check if the sangha exists
    const sangha = await prisma.sangha.findUnique({
      where: { sanghaId: sanghaId }
    })

    if (!sangha) {
      return NextResponse.json(
        { error: 'Sangha not found' },
        { status: 404 }
      )
    }

    // ⭐ Check if there's already a pending request
    const existingRequest = await prisma.sanghaReactivationRequest.findFirst({
      where: {
        sanghaId: sangha.id,
        status: 'PENDING'
      }
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending reactivation request. Please wait for review.' },
        { status: 400 }
      )
    }

    // ⭐ Create reactivation request
    const newRequest = await prisma.sanghaReactivationRequest.create({
      data: {
        sanghaId: sangha.id,
        adminName,
        adminEmail,
        adminPhone: adminPhone || '',
        reason,
        additionalInfo: additionalInfo || '',
        status: 'PENDING',
      }
    })

    console.log('✅ Reactivation request created:', newRequest.id)

    // ⭐⭐⭐ SEND EMAIL TO ADMIN ⭐⭐⭐
    try {
      await sendReactivationRequestEmail(
        adminEmail,
        adminName,
        sangha.sanghaId,
        reason
      )
      console.log('✅ Reactivation request email sent to:', adminEmail)
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: 'Reactivation request submitted successfully',
      requestId: newRequest.id
    })

  } catch (error) {
    console.error('❌ Error creating reactivation request:', error)
    return NextResponse.json(
      { error: 'Failed to submit reactivation request: ' + (error as Error).message },
      { status: 500 }
    )
  }
}