import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    console.log('🔍 ===== VERIFY OTP =====')
    console.log('🔍 Email:', email)
    console.log('🔍 OTP:', otp)

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({ 
      where: { email }
    })
    
    if (!user) {
      console.log('❌ User not found')
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('👤 User found with role:', user.role)

    // Check if already verified
    if (user.isVerified) {
      console.log('✅ User already verified')
      const redirectUrl = user.role.toUpperCase() === 'ADMIN' 
        ? '/admin/submit-form' 
        : '/dashboard'
      
      return NextResponse.json({
        success: true,
        message: 'Already verified',
        redirectUrl: redirectUrl,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      })
    }

    // Check OTP
    if (!user.otp) {
      console.log('❌ No OTP found')
      return NextResponse.json(
        { error: 'No OTP found. Please request a new OTP.' },
        { status: 400 }
      )
    }

    if (String(user.otp) !== String(otp)) {
      console.log('❌ OTP mismatch - Stored:', user.otp, 'Entered:', otp)
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      )
    }

    if (user.otpExpiry && new Date() > new Date(user.otpExpiry)) {
      console.log('❌ OTP expired')
      return NextResponse.json(
        { error: 'OTP expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Mark as verified
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        isActive: true,
        otp: null,
        otpExpiry: null,
      },
    })

    console.log('✅ User verified successfully!')
    console.log('✅ User role after update:', updatedUser.role)

    // Generate token
    const token = await generateToken(updatedUser.id, updatedUser.email, updatedUser.role)

    // ⭐⭐⭐ FIX: Convert role to uppercase for comparison
    const userRole = updatedUser.role.toUpperCase()
    
    let redirectUrl = '/login' // Default fallback
    
    if (userRole === 'ADMIN') {
      redirectUrl = '/admin/submit-form'
      console.log('✅ ADMIN -> Redirecting to:', redirectUrl)
    } else if (userRole === 'SUPERADMIN') {
      redirectUrl = '/dashboard/superadmin'
      console.log('✅ SUPERADMIN -> Redirecting to:', redirectUrl)
    } else {
      redirectUrl = '/dashboard/member'
      console.log('✅ MEMBER -> Redirecting to:', redirectUrl)
    }

    const userData = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
    }

    // ⭐⭐⭐ Create response with all data
    const response = NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      token: token,
      user: userData,
      redirectUrl: redirectUrl,
    })

    // Set HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    console.log('✅ Response sent with redirectUrl:', redirectUrl)
    console.log('✅ User data sent:', userData)

    return response

  } catch (error) {
    console.error('❌ Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}