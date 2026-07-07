import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export const sendOTPEmail = async (email: string, otp: string): Promise<void> => {
  // ✅ Ensure OTP is string
  const otpString = String(otp).padStart(6, '0')
  
  const mailOptions = {
    from: `"RS Associates" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'RS Associates - Email Verification OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
        <div style="background: linear-gradient(135deg, #1e1b4b, #4c1d95); padding: 20px; border-radius: 8px; text-align: center;">
          <h1 style="color: white; margin: 0;">RS Associates</h1>
          <p style="color: #a5b4fc; margin: 5px 0;">Email Verification</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 8px; margin-top: 20px;">
          <p style="font-size: 16px; color: #333;">Hello,</p>
          <p style="font-size: 16px; color: #333;">Your OTP for email verification is:</p>
          
          <div style="text-align: center; padding: 20px; margin: 20px 0; background: #f3f4f6; border-radius: 8px;">
            <h1 style="font-size: 48px; color: #4c1d95; letter-spacing: 8px; margin: 0;">${otpString}</h1>
          </div>
          
          <p style="font-size: 14px; color: #666;">This OTP will expire in <strong>10 minutes</strong>.</p>
          <p style="font-size: 14px; color: #666;">If you didn't request this, please ignore this email.</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© 2026 RS Associates. All rights reserved.</p>
        </div>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}

export const generateOTP = (): string => {
  // ✅ Return as string with leading zeros if needed
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