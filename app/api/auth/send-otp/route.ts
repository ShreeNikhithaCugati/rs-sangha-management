// app/api/auth/send-otp/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'

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
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    console.log('🔑 Generated OTP:', otp)
    console.log('⏰ OTP Expiry:', otpExpiry)

    // Save OTP to database
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
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      })

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP for RS Associates',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
            <div style="background: linear-gradient(135deg, #1e1b4b, #4c1d95); padding: 20px; border-radius: 8px; text-align: center;">
              <h1 style="color: white; margin: 0;">RS Associates</h1>
              <p style="color: #a5b4fc; margin: 5px 0;">Email Verification</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 8px; margin-top: 20px;">
              <p style="font-size: 16px; color: #333;">Hello <strong>${user.name || user.username}</strong>,</p>
              <p style="font-size: 16px; color: #333;">Your OTP for email verification is:</p>
              
              <div style="text-align: center; padding: 20px; margin: 20px 0; background: #f3f4f6; border-radius: 8px;">
                <h1 style="font-size: 48px; color: #4c1d95; letter-spacing: 8px; margin: 0;">${otp}</h1>
              </div>
              
              <p style="font-size: 14px; color: #666;">This OTP will expire in <strong>10 minutes</strong>.</p>
              <p style="font-size: 14px; color: #666;">If you didn't request this, please ignore this email.</p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>© 2025 RS Associates. All rights reserved.</p>
            </div>
          </div>
        `
      })

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