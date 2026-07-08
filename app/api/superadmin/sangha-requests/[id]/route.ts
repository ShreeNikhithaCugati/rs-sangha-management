import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { sendApprovalEmail, sendRejectionEmail } from '@/lib/email'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.split(' ')[1]

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = await verifyToken(token)
    if (!decoded || decoded.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const request = await prisma.sanghaRequest.findUnique({
      where: { id: params.id },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true
          }
        }
      }
    })

    if (!request) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(request)
  } catch (error) {
    console.error('Error fetching request:', error)
    return NextResponse.json(
      { error: 'Failed to fetch request' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.split(' ')[1]

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = await verifyToken(token)
    if (!decoded || decoded.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { action, sanghaId, rejectedReason } = body

    let updateData: any = {}

    if (action === 'approve') {
      const assignedSanghaId = sanghaId || `RS${Date.now().toString().slice(-6)}`
      
      updateData = {
        status: 'APPROVED',
        assignedSanghaId: assignedSanghaId
      }

      // Get the request details
      const request = await prisma.sanghaRequest.findUnique({
        where: { id: params.id },
        include: { admin: true }
      })

      if (!request) {
        return NextResponse.json(
          { error: 'Request not found' },
          { status: 404 }
        )
      }

      // ⭐ Generate unique code
      let baseCode = request.sanghaName.substring(0, 3).toUpperCase()
      let code = baseCode
      let counter = 1
      
      let existingSangha = await prisma.sangha.findUnique({
        where: { code: code }
      })
      
      while (existingSangha) {
        code = `${baseCode}${counter}`
        counter++
        existingSangha = await prisma.sangha.findUnique({
          where: { code: code }
        })
      }
      
      console.log(`✅ Generated unique code: ${code}`)

      // Create the sangha
      const sangha = await prisma.sangha.create({
        data: {
          sanghaId: assignedSanghaId,
          name: request.sanghaName,
          code: code,
          address: request.address || '',
          isActive: true,
        }
      })

      // Update the admin user
      await prisma.user.update({
        where: { id: request.adminId },
        data: { 
          sanghaId: sangha.id,
          isProfileComplete: true
        }
      })

      // Send approval email (don't break if fails)
      try {
        await sendApprovalEmail(
          request.adminEmail,
          request.adminName,
          assignedSanghaId,
          request.admin?.username || request.adminEmail.split('@')[0]
        )
        console.log('✅ Approval email sent to:', request.adminEmail)
      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError)
      }

    } else if (action === 'reject') {
      updateData = {
        status: 'REJECTED',
        rejectedReason: rejectedReason || 'No reason provided'
      }

      const request = await prisma.sanghaRequest.findUnique({
        where: { id: params.id }
      })

      if (request) {
        try {
          await sendRejectionEmail(
            request.adminEmail,
            request.adminName,
            rejectedReason || 'No reason provided'
          )
          console.log('✅ Rejection email sent to:', request.adminEmail)
        } catch (emailError) {
          console.error('❌ Email sending failed:', emailError)
        }
      }

    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "approve" or "reject"' },
        { status: 400 }
      )
    }

    const updatedRequest = await prisma.sanghaRequest.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      message: `Request ${action}ed successfully`,
      request: updatedRequest
    })

  } catch (error) {
    console.error('❌ Error updating request:', error)
    return NextResponse.json(
      { error: 'Failed to update request: ' + (error as Error).message },
      { status: 500 }
    )
  }
}