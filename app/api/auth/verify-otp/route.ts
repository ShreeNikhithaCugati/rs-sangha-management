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
    console.log('📝 Stored OTP:', user.otp)
    console.log('📝 Stored Expiry:', user.otpExpiry)
    console.log('📝 isVerified:', user.isVerified)

    // Check if already verified
    if (user.isVerified) {
      console.log('✅ Email already verified')
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      )
    }

    // Check if OTP exists
    if (!user.otp) {
      console.log('❌ No OTP found for user')
      return NextResponse.json(
        { error: 'No OTP found. Please request a new OTP.' },
        { status: 400 }
      )
    }

    // Compare OTP
    if (user.otp !== otp) {
      console.log('❌ OTP MISMATCH! Stored:', user.otp, 'Entered:', otp)
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      )
    }

    // Check if OTP expired
    if (new Date() > user.otpExpiry!) {
      console.log('❌ OTP expired')
      return NextResponse.json(
        { error: 'OTP expired' },
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

    const token = generateToken(user.id, user.email, user.role)

    // Determine redirect URL
    let redirectUrl = '/dashboard'
    
    if (user.role === 'ADMIN') {
      redirectUrl = '/dashboard/admin'
    } else if (user.role === 'SUPERADMIN') {
      redirectUrl = '/dashboard/superadmin'
    } else {
      redirectUrl = '/dashboard/member'
    }

    console.log('🔄 Redirecting to:', redirectUrl)

    return NextResponse.json({
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
  } catch (error) {
    console.error('❌ OTP verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}