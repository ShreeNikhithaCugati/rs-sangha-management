// app/api/auth/verify-otp/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    console.log('🔍 ===== VERIFY OTP START =====')
    console.log('🔍 Email:', email)
    console.log('🔍 Entered OTP:', otp)

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({ where: { email } })
    
    if (!user) {
      console.log('❌ User not found:', email)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('👤 User found:', { id: user.id, email: user.email, role: user.role })

    if (user.isVerified) {
      console.log('✅ Email already verified')
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      )
    }

    if (!user.otp) {
      console.log('❌ No OTP found for user')
      return NextResponse.json(
        { error: 'No OTP found. Please request a new OTP.' },
        { status: 400 }
      )
    }

    if (String(user.otp) !== String(otp)) {
      console.log('❌ OTP MISMATCH! Stored:', user.otp, 'Entered:', otp)
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      )
    }

    if (user.otpExpiry && new Date() > new Date(user.otpExpiry)) {
      console.log('❌ OTP expired at:', user.otpExpiry)
      return NextResponse.json(
        { error: 'OTP expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Mark user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        isActive: true,
        otp: null,
        otpExpiry: null,
      },
    })

    console.log('✅ User verified successfully!')

    const token = await generateToken(user.id, user.email, user.role)

    let redirectUrl = '/dashboard'
    
    if (user.role === 'ADMIN') {
      redirectUrl = '/admin/submit-form'
      console.log('👤 Admin verified - redirecting to submit form')
    } else if (user.role === 'SUPERADMIN') {
      redirectUrl = '/dashboard/superadmin'
      console.log('👑 SuperAdmin verified - redirecting to dashboard')
    } else {
      redirectUrl = '/dashboard/member'
      console.log('👤 Member verified - redirecting to dashboard')
    }

    console.log('🔄 Redirecting to:', redirectUrl)

    // ✅ Create response
    const response = NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      redirectUrl,
    })

    // ✅ ✅ ✅ FIX: Set cookie WITHOUT secure flag for localhost
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: false, // ✅ MUST be false for localhost (true only in production)
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    console.log('✅ Cookie set for middleware')

    return response
  } catch (error) {
    console.error('❌ OTP verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}