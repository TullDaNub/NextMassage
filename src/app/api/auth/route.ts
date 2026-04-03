import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { action, pin } = await request.json()

    if (action === 'login') {
      const adminPin = process.env.ADMIN_PIN || '9999'
      const receptionistPin = process.env.RECEPTIONIST_PIN || '1234'
      
      let role = null
      if (pin === adminPin) role = 'admin'
      else if (pin === receptionistPin) role = 'receptionist'

      if (role) {
        // Await cookies() for Next.js 15 compatibility, but works identically if Promise-wrapped
        const cookieStore = await cookies()
        cookieStore.set('staff_role', role, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7 // 1 week
        })
        return NextResponse.json({ success: true })
      }
      return NextResponse.json({ success: false, error: 'PIN ไม่ถูกต้อง' }, { status: 401 })
    }

    if (action === 'logout') {
      const cookieStore = await cookies()
      cookieStore.delete('staff_role')
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
