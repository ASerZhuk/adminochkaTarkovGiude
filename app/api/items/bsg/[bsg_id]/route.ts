import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import axios from 'axios'

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '')

export async function GET(_req: Request, { params }: { params: { bsg_id: string } }) {
  const token = cookies().get('aftsess')?.value
  const bsgId = params.bsg_id
  if (!bsgId) {
    return NextResponse.json({ detail: 'bsg_id is required' }, { status: 400 })
  }

  try {
    const resp = await axios.get(`${API_BASE_URL}/api/items/bsg/${encodeURIComponent(bsgId)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      validateStatus: () => true,
    })
    return NextResponse.json(resp.data, { status: resp.status })
  } catch (err: any) {
    const status = err?.response?.status ?? 500
    const detail = err?.response?.data?.detail || 'Upstream request failed'
    return NextResponse.json({ detail }, { status })
  }
}

