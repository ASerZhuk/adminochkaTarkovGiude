import { NextResponse } from 'next/server'

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '')

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body?.username || !body?.password) {
    return NextResponse.json({ detail: 'username and password required' }, { status: 400 })
  }

  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: body.username, password: body.password })
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({} as any))
    return NextResponse.json({ detail: data?.detail || 'Login failed' }, { status: res.status })
  }

  const data = await res.json()
  const token = data?.access_token
  if (!token) {
    return NextResponse.json({ detail: 'No token received' }, { status: 502 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set('aftsess', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    // secure: true, // enable when serving via HTTPS
    maxAge: 60 * 60, // 1 hour
  })
  return response
}
