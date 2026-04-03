import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { booking_code, customer_name, customer_phone, service_name, appointment_date, time_range } = data
    
    // Check if LINE Token is configured
    const token = process.env.LINE_NOTIFY_TOKEN
    
    if (!token) {
      // If no token, just gracefully return success so it doesn't break the booking flow, 
      // but ideally log this warning
      console.warn('LINE_NOTIFY_TOKEN is not set in environment variables')
      return NextResponse.json({ success: true, warning: 'LINE token not configured' })
    }

    const message = `
🔔 มีรายการจองคิวใหม่!
รหัส: ${booking_code}
ลูกค้า: ${customer_name} (${customer_phone})
บริการ: ${service_name}
วันที่: ${appointment_date}
เวลา: ${time_range}
`

    const response = await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}`
      },
      body: new URLSearchParams({ message }).toString()
    })

    if (!response.ok) {
      throw new Error(`LINE Notify returned status ${response.status}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending LINE notification:', error)
    return NextResponse.json({ success: false, error: 'Failed to send notification' }, { status: 500 })
  }
}
