// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { identifier, password, role, sanghaId } = await request.json()

    console.log('🔍 Login attempt:', { identifier, role })

    // Find user
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier }
        ]
      },
      include: {
        sangha: true
      }
    })
    
    if (!user) {
      console.log('❌ User not found:', identifier)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    console.log('👤 User found:', { email: user.email, role: user.role })

    // Check role
    if (user.role !== role) {
      console.log('❌ Role mismatch:', { userRole: user.role, selectedRole: role })
      return NextResponse.json(
        { error: `Invalid role. You are registered as ${user.role}.` },
        { status: 401 }
      )
    }

    // Check if active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is blocked. Please contact support.' },
        { status: 403 }
      )
    }

    // Check Sangha ID for Admin
    if (user.role === 'ADMIN') {
      if (!sanghaId) {
        return NextResponse.json(
          { error: 'Sangha ID is required for Admin login' },
          { status: 400 }
        )
      }

      const sangha = await prisma.sangha.findFirst({
        where: {
          sanghaId: sanghaId.toUpperCase(),
          adminId: user.id,
        }
      })

      if (!sangha) {
        console.log('❌ Invalid Sangha ID for admin:', sanghaId)
        return NextResponse.json(
          { error: 'Invalid Sangha ID. Please check with Super Admin.' },
          { status: 401 }
        )
      }
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password)
    if (!isValidPassword) {
      console.log('❌ Invalid password for:', identifier)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate token with await
    const token = await generateToken(user.id, user.email, user.role)

    console.log('✅ Login successful for:', user.email)

    // Prepare user data (exclude password)
    const { password: _, ...userWithoutPassword } = user

    // Create response with JSON body AND set cookie
    const response = NextResponse.json({
      success: true,
      token: token,
      user: userWithoutPassword,
    })

    // ✅ Set cookie with more explicit options
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: false, // Set to false for local development
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    // ✅ Add CORS headers for debugging
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000')

    console.log('✅ Token sent in response and cookie set')
    console.log('🔑 Token preview:', token.substring(0, 20) + '...')

    return response

  } catch (error) {
    console.error('❌ Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}