import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { sendReactivationResultEmail } from '@/lib/email'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.split(' ')[1]

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      )
    }

    const decoded = await verifyToken(token)
    if (!decoded || decoded.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Only Super Admin can perform this action' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { action, rejectionReason } = body

    if (action === 'approve') {
      // Get the request
      const requestData = await prisma.sanghaReactivationRequest.findUnique({
        where: { id: params.id }
      })

      if (!requestData) {
        return NextResponse.json(
          { error: 'Request not found' },
          { status: 404 }
        )
      }

      // Reactivate the Sangha
      await prisma.sangha.update({
        where: { id: requestData.sanghaId },
        data: { isActive: true }
      })

      // Update the request status
      const updatedRequest = await prisma.sanghaReactivationRequest.update({
        where: { id: params.id },
        data: {
          status: 'APPROVED',
          reviewedAt: new Date(),
          reviewedBy: decoded.id,
        }
      })

      // Send approval email to admin
      try {
        await sendReactivationResultEmail(
          requestData.adminEmail,
          requestData.adminName,
          requestData.sanghaId,
          'approved'
        )
        console.log('✅ Approval email sent to:', requestData.adminEmail)
      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError)
      }

      return NextResponse.json({
        success: true,
        message: 'Sangha reactivated successfully',
        request: updatedRequest
      })

    } else if (action === 'reject') {
      if (!rejectionReason) {
        return NextResponse.json(
          { error: 'Rejection reason is required' },
          { status: 400 }
        )
      }

      const requestData = await prisma.sanghaReactivationRequest.findUnique({
        where: { id: params.id }
      })

      if (!requestData) {
        return NextResponse.json(
          { error: 'Request not found' },
          { status: 404 }
        )
      }

      // Update the request status
      const updatedRequest = await prisma.sanghaReactivationRequest.update({
        where: { id: params.id },
        data: {
          status: 'REJECTED',
          reviewedAt: new Date(),
          reviewedBy: decoded.id,
          rejectionReason: rejectionReason,
        }
      })

      // Send rejection email to admin
      try {
        await sendReactivationResultEmail(
          requestData.adminEmail,
          requestData.adminName,
          requestData.sanghaId,
          'rejected',
          rejectionReason
        )
        console.log('✅ Rejection email sent to:', requestData.adminEmail)
      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError)
      }

      return NextResponse.json({
        success: true,
        message: 'Reactivation request rejected',
        request: updatedRequest
      })

    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "approve" or "reject"' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('❌ Error processing reactivation request:', error)
    return NextResponse.json(
      { error: 'Failed to process request: ' + (error as Error).message },
      { status: 500 }
    )
  }
}