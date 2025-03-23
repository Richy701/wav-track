import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { authService } from '@/lib/services/auth'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Check for guest data cleanup
  await authService.cleanupGuestData()

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is not signed in and the current path is not /login,
  // redirect the user to /login
  if (!session && req.nextUrl.pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
