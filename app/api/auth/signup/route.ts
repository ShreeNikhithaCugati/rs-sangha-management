import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { generateOTP, sendOTPEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { username, name, email, password, phone, role } = await request.json()

    console.log('📝 ===== SIGNUP START =====')
    console.log('📝 Email:', email)
    console.log('📝 Role:', role)

    // Check if username exists
    const existingUsername = await prisma.user.findUnique({ 
      where: { username } 
    })
    if (existingUsername) {
      console.log('❌ Username already taken:', username)
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 400 }
      )
    }

    // Check if email exists
    const existingUser = await prisma.user.findUnique({ 
      where: { email } 
    })
    if (existingUser) {
      console.log('❌ Email already registered:', email)
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(password)
    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

    console.log('🔑 Generated OTP:', otp)

    const user = await prisma.user.create({
      data: {
        username,
        name,
        email,
        password: hashedPassword,
        phone,
        role: role || 'MEMBER',
        otp,
        otpExpiry,
        isVerified: false,
        isActive: true,
        isProfileComplete: false,
      },
    })

    console.log('✅ User created with OTP:', { id: user.id, email: user.email, otp: user.otp })

    // Send OTP email
    await sendOTPEmail(email, otp)
    console.log('📧 OTP email sent to:', email)

    return NextResponse.json({
      message: 'User created. Please verify your email with OTP.',
      userId: user.id,
    })
  } catch (error) {
    console.error('❌ Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}