import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const isProtectedAdmin = request.nextUrl.pathname.startsWith('/admin')
  const isProtectedStatus = request.nextUrl.pathname.startsWith('/status')

  if (isProtectedAdmin || isProtectedStatus) {
    const staffRole = request.cookies.get('staff_role')
    
    // Redirect if not logged in at all
    if (!staffRole) {
      return NextResponse.redirect(new URL('/staff', request.url))
    }

    // Redirect if trying to access admin but not an admin
    if (isProtectedAdmin && staffRole.value !== 'admin') {
       return NextResponse.redirect(new URL('/status', request.url))
    }
    
    // Access to /status is allowed for both 'admin' and 'receptionist'
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/status/:path*'],
}
