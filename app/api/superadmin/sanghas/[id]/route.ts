import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function DELETE(
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

    const sangha = await prisma.sangha.findUnique({
      where: { id: params.id },
      include: { admin: true }
    })

    if (!sangha) {
      return NextResponse.json({ error: 'Sangha not found' }, { status: 404 })
    }

    // ✅ Check if Sangha has an admin
    if (sangha.admin) {
      return NextResponse.json(
        { error: 'Cannot delete Sangha with an assigned Admin' },
        { status: 400 }
      )
    }

    await prisma.sangha.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Sangha deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting sangha:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}