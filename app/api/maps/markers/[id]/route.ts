import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import axios from 'axios'

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '')

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const token = cookies().get('aftsess')?.value
  if (!token) {
    return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 })
  }
  const { id } = params
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ detail: 'Invalid JSON' }, { status: 400 })
  }

  try {
    const resp = await axios.put(`${API_BASE_URL}/api/maps/markers/${id}`, body, {
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

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const token = cookies().get('aftsess')?.value
  if (!token) {
    return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 })
  }
  const { id } = params
  try {
    const resp = await axios.delete(`${API_BASE_URL}/api/maps/markers/${id}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      validateStatus: () => true,
    })
    // Если 204/205 — отправляем пустой ответ без тела, иначе проксируем JSON
    if (resp.status === 204 || resp.status === 205) {
      return new NextResponse(null, { status: resp.status })
    }
    return NextResponse.json(resp.data ?? {}, { status: resp.status })
  } catch (err: any) {
    const status = err?.response?.status ?? 500
    const detail = err?.response?.data?.detail || 'Upstream request failed'
    return NextResponse.json({ detail }, { status })
  }
}
