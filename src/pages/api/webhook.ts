import { NextRequest, NextResponse } from 'next/server'
import { paymentService } from '@/lib/services/payment'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('Webhook received:', body)
    
    // Verify webhook signature (you should implement this for security)
    // const signature = request.headers.get('x-signature')
    // if (!verifySignature(body, signature)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }
    
    // Process the webhook
    const result = await paymentService.handleWebhook(body)
    
    if (result.error) {
      console.error('Webhook processing error:', result.error)
      return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 