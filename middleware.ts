import { NextResponse, NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Public paths
  if (pathname.startsWith('/api')) return NextResponse.next()
  if (pathname.startsWith('/login')) return NextResponse.next()

  const token = req.cookies.get('aftsess')?.value
  if (!token) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('info', 'Требуется вход в систему')
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)']
}

