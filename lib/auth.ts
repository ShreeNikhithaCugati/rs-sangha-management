import { jwtVerify, SignJWT } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'
const secretKey = new TextEncoder().encode(JWT_SECRET)

export const hashPassword = async (password: string): Promise<string> => {
  const bcrypt = await import('bcryptjs')
  return await bcrypt.hash(password, 10)
}

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  const bcrypt = await import('bcryptjs')
  return await bcrypt.compare(password, hashedPassword)
}

export const generateToken = async (userId: string, email: string, role: string): Promise<string> => {
  const normalizedRole = role.toUpperCase()
  
  console.log('🔐 Generating token for:', { userId, email, role: normalizedRole })
  
  const token = await new SignJWT({ 
    id: userId,
    userId: userId,
    email: email,
    role: normalizedRole
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey)
  
  console.log('✅ Token generated successfully')
  return token
}

export const verifyToken = async (token: string): Promise<any> => {
  try {
    const { payload } = await jwtVerify(token, secretKey)
    console.log('🔍 Token payload:', JSON.stringify(payload, null, 2))
    
    // ⭐ Make sure we return all fields
    return {
      id: payload.id || payload.userId,
      userId: payload.userId || payload.id,
      email: payload.email,
      role: payload.role,
      ...payload
    }
  } catch (error) {
    console.log('❌ Token verification failed:', error)
    return null
  }
}