import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1]
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded || decoded.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { isActive } = await req.json()
    
    const sangha = await prisma.sangha.update({
      where: { id: params.id },
      data: { isActive }
    })

    return NextResponse.json({ success: true, sangha })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update sangha' },
      { status: 500 }
    )
  }
}