import nodemailer from 'nodemailer'

// Create transporter only if email is configured
let transporter: nodemailer.Transporter | null = null

try {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
    console.log('✅ Email transporter configured')
  } else {
    console.log('⚠️ Email not configured - emails will be logged only')
  }
} catch (error) {
  console.error('❌ Email configuration error:', error)
}

// ==================== OTP EMAIL ====================
export const sendOTPEmail = async (email: string, otp: string): Promise<void> => {
  const otpString = String(otp).padStart(6, '0')
  
  console.log(`📧 [OTP] To: ${email}, OTP: ${otpString}`)
  
  if (!transporter) {
    console.log('⚠️ Email not sent (transporter not configured)')
    return
  }

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

  try {
    await transporter.sendMail(mailOptions)
    console.log(`✅ OTP email sent to: ${email}`)
  } catch (error) {
    console.error(`❌ Failed to send OTP email to ${email}:`, error)
  }
}

// ==================== GENERATE OTP ====================
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// ==================== APPROVAL EMAIL ====================
export const sendApprovalEmail = async (email: string, name: string, sanghaId: string, username: string) => {
  console.log(`📧 [APPROVAL] To: ${email}, Sangha ID: ${sanghaId}`)
  
  if (!transporter) {
    console.log('⚠️ Approval email not sent (transporter not configured)')
    return
  }

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

  try {
    await transporter.sendMail(mailOptions)
    console.log(`✅ Approval email sent to: ${email}`)
  } catch (error) {
    console.error(`❌ Failed to send approval email to ${email}:`, error)
  }
}

// ==================== REJECTION EMAIL ====================
export const sendRejectionEmail = async (email: string, name: string, reason: string) => {
  console.log(`📧 [REJECTION] To: ${email}, Reason: ${reason}`)
  
  if (!transporter) {
    console.log('⚠️ Rejection email not sent (transporter not configured)')
    return
  }

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

  try {
    await transporter.sendMail(mailOptions)
    console.log(`✅ Rejection email sent to: ${email}`)
  } catch (error) {
    console.error(`❌ Failed to send rejection email to ${email}:`, error)
  }
}

// ==================== ADMIN CREDENTIALS EMAIL ====================
export const sendAdminCredentialsEmail = async (
  email: string,
  name: string,
  username: string,
  password: string,
  sanghaId: string | null,
  sanghaName: string | null
) => {
  console.log(`📧 [ADMIN CREDENTIALS] To: ${email}, Sangha: ${sanghaId || 'Not assigned'}`)
  
  if (!transporter) {
    console.log('⚠️ Admin credentials email not sent (transporter not configured)')
    return
  }

  const sanghaSection = sanghaId ? `
    <div style="background: #eef2ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
      <p style="color: #4F46E5; margin: 0; font-size: 14px;">Your Sangha ID is:</p>
      <h1 style="color: #4F46E5; font-size: 40px; letter-spacing: 8px; margin: 10px 0; background: #dbeafe; padding: 10px 20px; border-radius: 8px; display: inline-block;">
        ${sanghaId}
      </h1>
      <p style="color: #4F46E5; margin: 5px 0 0 0; font-size: 16px;">
        Sangha Name: <strong>${sanghaName || 'N/A'}</strong>
      </p>
    </div>
  ` : `
    <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 16px 0; text-align: center;">
      <p style="color: #d97706; margin: 0; font-size: 14px;">
        ⚠️ No Sangha assigned yet. Please contact Super Admin for assignment.
      </p>
    </div>
  `

  const mailOptions = {
    from: `"RS Associates" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🎉 Welcome to RS Associates - Your Admin Account Details',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; border-radius: 12px;">
        <div style="text-align: center; padding: 20px 0;">
          <h1 style="color: #4F46E5; margin: 0;">🏛️ RS Associates</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #1e293b; margin-top: 0;">🎉 Welcome ${name}!</h2>
          
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            You have been added as an <strong style="color: #4F46E5;">Admin</strong> in RS Associates Sangha Management System.
          </p>
          
          <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="color: #1e293b; margin: 0 0 12px 0; font-size: 16px;">🔑 Your Login Credentials</h3>
            <p style="margin: 6px 0; font-size: 14px; color: #334155;">
              <strong>Username:</strong> ${username}
            </p>
            <p style="margin: 6px 0; font-size: 14px; color: #334155;">
              <strong>Temporary Password:</strong> <span style="background: #e2e8f0; padding: 2px 10px; border-radius: 4px; font-weight: 600;">${password}</span>
            </p>
            <p style="margin: 6px 0; font-size: 12px; color: #94a3b8;">
              ⚠️ Please change your password after first login.
            </p>
          </div>
          
          ${sanghaSection}
          
          <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0; font-size: 14px; color: #334155;">
              <strong>📋 Login Instructions:</strong><br />
              1. Go to the RS Associates login page<br />
              2. Enter your <strong>Username</strong>: ${username}<br />
              3. Enter your <strong>Temporary Password</strong><br />
              4. Select <strong>Role</strong>: Admin<br />
              ${sanghaId ? `5. Enter your <strong>Sangha ID</strong>: ${sanghaId}` : ''}
            </p>
          </div>
          
          <p style="color: #475569; font-size: 14px; margin-top: 16px;">
            If you have any questions, please contact the Super Admin.
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px 0; color: #94a3b8; font-size: 12px;">
          <p>© 2026 RS Associates. All rights reserved.</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`✅ Admin credentials email sent to: ${email}`)
  } catch (error) {
    console.error(`❌ Failed to send admin credentials email to ${email}:`, error)
  }
}

// ==================== REACTIVATION REQUEST EMAIL ====================
export const sendReactivationRequestEmail = async (
  email: string,
  name: string,
  sanghaId: string,
  reason: string
) => {
  console.log(`📧 [REACTIVATION REQUEST] To: ${email}`)
  
  if (!transporter) {
    console.log('⚠️ Email not sent (transporter not configured)')
    return
  }

  const mailOptions = {
    from: `"RS Associates" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '📋 Sangha Reactivation Request Submitted',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; border-radius: 12px;">
        <div style="text-align: center; padding: 20px 0;">
          <h1 style="color: #4F46E5; margin: 0;">🏛️ RS Associates</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #1e293b; margin-top: 0;">Hi ${name},</h2>
          
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Your reactivation request for Sangha <strong>${sanghaId}</strong> has been submitted successfully!
          </p>
          
          <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0; font-size: 14px; color: #334155;">
              <strong>Reason:</strong> ${reason}
            </p>
          </div>
          
          <p style="color: #475569; font-size: 14px;">
            The Super Admin will review your request and notify you once it's approved or rejected.
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px 0; color: #94a3b8; font-size: 12px;">
          <p>© 2026 RS Associates. All rights reserved.</p>
        </div>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`✅ Reactivation request email sent to: ${email}`)
  } catch (error) {
    console.error(`❌ Failed to send email to ${email}:`, error)
  }
}

// ==================== REACTIVATION RESULT EMAIL ====================
export const sendReactivationResultEmail = async (
  email: string,
  name: string,
  sanghaId: string,
  status: 'approved' | 'rejected',
  reason?: string
) => {
  console.log(`📧 [REACTIVATION RESULT] To: ${email}, Status: ${status}`)
  
  if (!transporter) {
    console.log('⚠️ Email not sent (transporter not configured)')
    return
  }

  const isApproved = status === 'approved'
  
  const mailOptions = {
    from: `"RS Associates" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: isApproved ? '✅ Sangha Reactivation Approved!' : '❌ Sangha Reactivation Rejected',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; border-radius: 12px;">
        <div style="text-align: center; padding: 20px 0;">
          <h1 style="color: #4F46E5; margin: 0;">🏛️ RS Associates</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #1e293b; margin-top: 0;">Hi ${name},</h2>
          
          ${isApproved ? `
            <p style="color: #22c55e; font-size: 18px; font-weight: 600;">
              ✅ Your Sangha has been reactivated!
            </p>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
              Your Sangha <strong>${sanghaId}</strong> has been successfully reactivated by the Super Admin.
            </p>
            <p style="color: #475569; font-size: 14px;">
              You can now login and manage your Sangha again.
            </p>
          ` : `
            <p style="color: #ef4444; font-size: 18px; font-weight: 600;">
              ❌ Reactivation Request Rejected
            </p>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
              Your reactivation request for Sangha <strong>${sanghaId}</strong> has been rejected.
            </p>
            ${reason ? `
              <div style="background: #fef2f2; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p style="color: #dc2626; margin: 0; font-size: 14px;">
                  <strong>Reason:</strong> ${reason}
                </p>
              </div>
            ` : ''}
            <p style="color: #475569; font-size: 14px;">
              If you have any questions, please contact the Super Admin.
            </p>
          `}
        </div>
        
        <div style="text-align: center; padding: 20px 0; color: #94a3b8; font-size: 12px;">
          <p>© 2026 RS Associates. All rights reserved.</p>
        </div>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`✅ Reactivation result email sent to: ${email}`)
  } catch (error) {
    console.error(`❌ Failed to send email to ${email}:`, error)
  }
}