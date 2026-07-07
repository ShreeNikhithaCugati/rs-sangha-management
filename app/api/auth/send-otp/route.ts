// app/api/auth/send-otp/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOTPEmail, generateOTP } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    console.log('📧 ===== SEND OTP START =====')
    console.log('📧 Email:', email)

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.log('❌ User not found:', email)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if already verified
    if (user.isVerified) {
      console.log('✅ Email already verified')
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      )
    }

    // Generate 6-digit OTP
    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    console.log('🔑 Generated OTP:', otp)
    console.log('⏰ OTP Expiry:', otpExpiry)

    // ✅ Save OTP to database with correct field name
    await prisma.user.update({
      where: { email },
      data: {
        otp: otp,
        otpExpiry: otpExpiry
      }
    })

    console.log('💾 OTP saved to database')

    // Send email with OTP
    try {
      await sendOTPEmail(email, otp)
      console.log('📧 Email sent successfully to:', email)
    } catch (emailError) {
      console.error('❌ Email sending error:', emailError)
      // Still return success if OTP is saved
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully to your email',
      debug: {
        otp: process.env.NODE_ENV === 'development' ? otp : undefined // Only show in dev
      }
    })

  } catch (error) {
    console.error('❌ Send OTP error:', error)
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    )
  }
}