import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import axios from 'axios'

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '')

export async function POST(req: Request) {
  const token = cookies().get('aftsess')?.value
  if (!token) {
    return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ detail: 'Invalid JSON' }, { status: 400 })
  }

  try {
    const resp = await axios.post(`${API_BASE_URL}/api/maps/layers/create`, body, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      validateStatus: () => true,
    })
    return NextResponse.json(resp.data, { status: resp.status })
  } catch (err: any) {
    const status = err?.response?.status ?? 500
    const detail = err?.response?.data?.detail || 'Upstream request failed'
    return NextResponse.json({ detail }, { status })
  }
}

