//app/api/auth/login/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword, generateToken } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { identifier, password, role, sanghaId } = await req.json()

    // Find user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier }
        ]
      },
      include: { sangha: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check password
    const isValid = await comparePassword(password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check role matches
    if (user.role !== role) {
      return NextResponse.json(
        { error: `Invalid role. You are registered as ${user.role}` },
        { status: 403 }
      )
    }

    // ✅ If user is ADMIN, check Sangha ID
    if (user.role === 'ADMIN') {
      // Check if admin has a pending request
      const pendingRequest = await prisma.sanghaRequest.findFirst({
        where: {
          adminId: user.id,
          status: 'PENDING'
        }
      })

      // If admin has pending request, don't allow login
      if (pendingRequest) {
        return NextResponse.json(
          { error: 'Your Sangha request is pending approval. Please wait for SuperAdmin to approve.' },
          { status: 403 }
        )
      }

      // If admin doesn't have sanghaId and no pending request, they need to submit form
      if (!user.sanghaId) {
        return NextResponse.json({
          error: 'Please complete your Sangha registration form first.',
          redirectTo: '/admin/submit-form'
        }, { status: 403 })
      }

      // ✅ Admin must enter Sangha ID to login
      if (!sanghaId) {
        return NextResponse.json(
          { error: 'Please enter your Sangha ID to login.' },
          { status: 400 }
        )
      }

      // Verify Sangha ID matches
      if (user.sangha?.sanghaId !== sanghaId.toUpperCase()) {
        return NextResponse.json(
          { error: 'Invalid Sangha ID. Please check and try again.' },
          { status: 400 }
        )
      }

      // Check if Sangha is active
      if (user.sangha && !user.sangha.isActive) {
        return NextResponse.json(
          { error: 'Your Sangha has been deactivated. Please contact SuperAdmin.' },
          { status: 403 }
        )
      }
    }

    // Generate token
    const token = await generateToken(user.id, user.email, user.role)

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        sanghaId: user.sangha?.sanghaId || null,
        isProfileComplete: user.isProfileComplete || false
      }
    })

    // Set cookie for middleware
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}