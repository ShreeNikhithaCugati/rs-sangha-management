import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export const sendOTPEmail = async (email: string, otp: string): Promise<void> => {
  const mailOptions = {
    from: `"RS Associates" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'RS Associates - Email Verification OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4F46E5;">Welcome to RS Associates!</h2>
        <p>Your OTP for email verification is:</p>
        <h1 style="font-size: 32px; color: #4F46E5; letter-spacing: 4px; text-align: center;">${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// ✅ APPROVAL EMAIL WITH SANGHA ID
export const sendApprovalEmail = async (email: string, name: string, sanghaId: string, username: string) => {
  const mailOptions = {
    from: `"RS Associates" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🎉 Your Sangha Has Been Approved!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; border-radius: 12px;">
        <div style="text-align: center; padding: 20px 0;">
          <h1 style="color: #4F46E5; margin: 0;">🏛️ RS Associates</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #1e293b; margin-top: 0;">🎉 Congratulations ${name}!</h2>
          
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Your Sangha creation request has been <strong style="color: #22c55e;">approved</strong> by the Super Admin!
          </p>
          
          <div style="background: #eef2ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="color: #4F46E5; margin: 0; font-size: 14px;">Your Sangha ID is:</p>
            <h1 style="color: #4F46E5; font-size: 48px; letter-spacing: 8px; margin: 10px 0; background: #dbeafe; padding: 10px 20px; border-radius: 8px; display: inline-block;">
              ${sanghaId}
            </h1>
          </div>
          
          <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0; font-size: 14px; color: #334155;">
              <strong>🔑 Login Instructions:</strong><br />
              1. Go to the RS Associates login page<br />
              2. Enter your <strong>Username</strong>: ${username}<br />
              3. Enter your <strong>Password</strong> (the one you created)<br />
              4. Select <strong>Role</strong>: Admin<br />
              5. Enter your <strong>Sangha ID</strong>: ${sanghaId}
            </p>
          </div>
          
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            You can now login to your dashboard and start managing your Sangha.
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px 0; color: #94a3b8; font-size: 12px;">
          <p>© 2026 RS Associates. All rights reserved.</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}

// ✅ APPROVAL SMS WITH SANGHA ID (Using Twilio)
export const sendApprovalSMS = async (phone: string, sanghaId: string, name: string) => {
  try {
    // You need to install twilio: npm install twilio
    // And add these to .env:
    // TWILIO_ACCOUNT_SID=your_account_sid
    // TWILIO_AUTH_TOKEN=your_auth_token
    // TWILIO_PHONE_NUMBER=your_twilio_phone_number
    
    const twilio = require('twilio')
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    )
    
    await client.messages.create({
      body: `🎉 ${name}, your Sangha has been approved! Your Sangha ID is: ${sanghaId}. Please login with your username and this ID. - RS Associates`,
      to: phone,
      from: process.env.TWILIO_PHONE_NUMBER!,
    })
    
    console.log(`✅ SMS sent to ${phone} with Sangha ID: ${sanghaId}`)
  } catch (error) {
    console.error('❌ SMS sending failed:', error)
    // Don't throw error - email is more important
  }
}

export const sendRejectionEmail = async (email: string, name: string, reason: string) => {
  const mailOptions = {
    from: `"RS Associates" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '📋 Update on Your Sangha Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; border-radius: 12px;">
        <div style="text-align: center; padding: 20px 0;">
          <h1 style="color: #4F46E5; margin: 0;">🏛️ RS Associates</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #1e293b; margin-top: 0;">Hi ${name},</h2>
          
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Your Sangha creation request has been <strong style="color: #ef4444;">rejected</strong>.
          </p>
          
          <div style="background: #fef2f2; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="color: #dc2626; margin: 0; font-size: 14px;">
              <strong>Reason:</strong> ${reason}
            </p>
          </div>
          
          <p style="color: #475569; font-size: 14px;">
            If you have any questions, please contact the Super Admin.
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px 0; color: #94a3b8; font-size: 12px;">
          <p>© 2026 RS Associates. All rights reserved.</p>
        </div>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}