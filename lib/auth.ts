// lib/auth.ts
import { jwtVerify, SignJWT } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'
const secretKey = new TextEncoder().encode(JWT_SECRET)

// These functions stay the same (they work fine)
export const hashPassword = async (password: string): Promise<string> => {
  // Keep your existing bcrypt code
  const bcrypt = await import('bcryptjs')
  return await bcrypt.hash(password, 10)
}

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  const bcrypt = await import('bcryptjs')
  return await bcrypt.compare(password, hashedPassword)
}

// ✅ CHANGE THIS - Make it async and use jose
// lib/auth.ts - Update generateToken to enforce uppercase
export const generateToken = async (userId: string, email: string, role: string): Promise<string> => {
  // ✅ Force role to uppercase
  const normalizedRole = role.toUpperCase()
  
  const token = await new SignJWT({ 
    userId, 
    email, 
    role: normalizedRole // Use uppercase
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey)
  return token
}
// ✅ CHANGE THIS - Make it async and use jose
export const verifyToken = async (token: string): Promise<any> => {
  try {
    const { payload } = await jwtVerify(token, secretKey)
    return payload
  } catch (error) {
    console.log('❌ Token verification failed:', error)
    return null
  }
}