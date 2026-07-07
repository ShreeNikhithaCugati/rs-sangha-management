import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Forbidden - Only Super Admin can create admins' }, { status: 403 })
    }

    const { username, name, email, password, phone, sanghaId } = await request.json()

    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    const existingUsername = await prisma.user.findUnique({ where: { username } })
    if (existingUsername) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
    }

    const sangha = await prisma.sangha.findUnique({
      where: { id: sanghaId },
      include: { admin: true }
    })

    if (!sangha) {
      return NextResponse.json({ error: 'Sangha not found' }, { status: 404 })
    }

    if (sangha.admin) {
      return NextResponse.json(
        { error: 'This Sangha already has an admin. Only 1 admin per Sangha is allowed.' },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(password)

    const admin = await prisma.user.create({
      data: {
        username,
        name,
        email,
        password: hashedPassword,
        phone: phone || '',
        role: 'ADMIN',
        isVerified: true,
        isActive: true,
        sanghaId: sangha.id,
      },
    })

    return NextResponse.json({
      message: 'Admin created successfully!',
      tempPassword: password,
      admin: {
        name: admin.name,
        email: admin.email,
        username: admin.username,
        role: admin.role,
      },
      sangha: {
        name: sangha.name,
        id: sangha.sanghaId,
      },
    })
  } catch (error) {
    console.error('Create admin error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}