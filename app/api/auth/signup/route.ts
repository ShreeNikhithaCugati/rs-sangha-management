import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'
import { sendOTPEmail, generateOTP } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const { name, email, password, username, phone, address, aadharNumber, role } = await req.json()

    // ✅ Log the received data for debugging
    console.log('📝 Signup data received:', { name, email, username, phone, address, aadharNumber, role })

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username: username || email.split('@')[0] }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Generate OTP
    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // ✅ Create user with correct field name: otpExpiry (not otpExpiresAt)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        username: username || email.split('@')[0],
        password: hashedPassword,
        phone: phone || '',
        address: address || '',
        aadharNumber: aadharNumber || '',
        role: role || 'MEMBER',
        isVerified: false,
        isProfileComplete: false,
        otp: otp,
        otpExpiry: otpExpiry,  // ✅ Changed from otpExpiresAt to otpExpiry
        sanghaId: null
      }
    })

    console.log('✅ User created with OTP:', otp)
    console.log('⏰ OTP Expiry:', otpExpiry)

    // Send OTP email
    try {
      await sendOTPEmail(email, otp)
      console.log('📧 OTP email sent to:', email)
    } catch (emailError) {
      console.error('OTP email failed:', emailError)
    }

    // Generate token
    const token = await generateToken(user.id, user.email, user.role)

    // ✅ If user is ADMIN, they need to submit form
    const redirectTo = user.role === 'ADMIN' ? '/admin/submit-form' : '/verify-otp'

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        isProfileComplete: false
      },
      redirectTo: redirectTo,
      message: user.role === 'ADMIN' 
        ? 'Please complete your Sangha registration form.'
        : 'Please verify your email with OTP.'
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Failed to create account: ' + (error as Error).message },
      { status: 500 }
    )
  }
}