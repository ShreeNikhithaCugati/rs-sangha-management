import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { sanghaId } = await request.json()

    if (!sanghaId) {
      return NextResponse.json(
        { error: 'Sangha ID is required' },
        { status: 400 }
      )
    }

    // Check if sangha exists
    const sangha = await prisma.sangha.findUnique({
      where: { id: sanghaId },
      include: { admin: true }
    })

    if (!sangha) {
      return NextResponse.json(
        { error: 'Sangha not found' },
        { status: 404 }
      )
    }

    if (sangha.admin) {
      return NextResponse.json(
        { error: 'This Sangha already has an admin' },
        { status: 400 }
      )
    }

    // Check if admin exists
    const admin = await prisma.user.findUnique({
      where: { id: params.id }
    })

    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      )
    }

    // Assign admin to sangha
    const updatedAdmin = await prisma.user.update({
      where: { id: params.id },
      data: {
        sanghaId: sanghaId,
        isProfileComplete: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Admin assigned to Sangha successfully',
      admin: updatedAdmin
    })

  } catch (error) {
    console.error('Error assigning admin:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}