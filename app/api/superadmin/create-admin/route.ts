import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { verifyToken } from '@/lib/auth'
import { sendAdminCredentialsEmail } from '@/lib/email' // ⭐ Import email function

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
        { error: 'Forbidden - Only Super Admin can create admins' },
        { status: 403 }
      )
    }

    const { username, name, email, password, phone, sanghaId } = await request.json()

    // Validate admin fields
    if (!username || !name || !email || !password) {
      return NextResponse.json(
        { error: 'Username, name, email, and password are required' },
        { status: 400 }
      )
    }

    // Check if email exists
    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Check if username exists
    const existingUsername = await prisma.user.findUnique({ where: { username } })
    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 400 }
      )
    }

    // If sanghaId is provided, check if sangha exists
    let sanghaDetails = null
    if (sanghaId) {
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
      
      sanghaDetails = sangha
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create Admin
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
        sanghaId: sanghaId || null,
        isProfileComplete: !!sanghaId,
      },
    })

    // ⭐⭐⭐ SEND EMAIL TO ADMIN ⭐⭐⭐
    try {
      if (sanghaDetails) {
        // If admin is assigned to a sangha, send credentials + sangha info
        await sendAdminCredentialsEmail(
          admin.email,
          admin.name,
          admin.username,
          password, // Temporary password
          sanghaDetails.sanghaId, // Sangha ID
          sanghaDetails.name // Sangha Name
        )
        console.log('✅ Credentials email sent to:', admin.email)
      } else {
        // If admin is created without sangha, send only credentials
        await sendAdminCredentialsEmail(
          admin.email,
          admin.name,
          admin.username,
          password,
          null, // No sangha assigned yet
          null
        )
        console.log('✅ Credentials email sent to:', admin.email)
      }
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError)
      // Don't throw error - admin is already created
    }

    return NextResponse.json({
      success: true,
      message: 'Admin created successfully! Credentials sent to email.',
      tempPassword: password,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        username: admin.username,
        role: admin.role,
        sanghaId: admin.sanghaId,
      },
      sangha: sanghaDetails ? {
        id: sanghaDetails.id,
        name: sanghaDetails.name,
        sanghaId: sanghaDetails.sanghaId,
      } : null,
    })

  } catch (error) {
    console.error('Create admin error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}