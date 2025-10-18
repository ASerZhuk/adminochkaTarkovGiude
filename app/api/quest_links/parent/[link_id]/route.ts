import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import axios from 'axios'

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '')

export async function DELETE(_req: Request, { params }: { params: { link_id: string } }) {
  const token = cookies().get('aftsess')?.value
  if (!token) {
    return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 })
  }

  const linkId = params.link_id
  if (!linkId) {
    return NextResponse.json({ detail: 'link_id is required' }, { status: 400 })
  }

  try {
    const resp = await axios.delete(`${API_BASE_URL}/api/quest_links/parent/${encodeURIComponent(linkId)}`, {
      headers: {
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

