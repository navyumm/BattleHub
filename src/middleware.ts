import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // PUBLIC ROUTES
  const isPublicPath =
    path === '/' ||
    path === '/login' ||
    path === '/signup' ||
    path === '/verifyemail'

  const token = request.cookies.get('token')?.value || ''


  //  Block PUBLIC routes
  // ---------------------------------------
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL('/play', request.url))
  }

  //  Block PRIVATE routes
  // ---------------------------------------
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',    
    '/login',
    '/signup',
    '/verifyemail',
    '/profile',
    '/play',
    '/leaderboard',
  ]
}
