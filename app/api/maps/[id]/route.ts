import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import axios from 'axios'

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '')

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const token = cookies().get('aftsess')?.value
  if (!token) {
    return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 })
  }

  const id = params.id
  if (!id) {
    return NextResponse.json({ detail: 'Map id is required' }, { status: 400 })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ detail: 'Invalid JSON' }, { status: 400 })
  }

  try {
    const form = new URLSearchParams()
    if (typeof body?.name === 'string') form.append('name', body.name)
    if (typeof body?.pmc_range === 'string') form.append('pmc_range', body.pmc_range)
    if (typeof body?.seo_link === 'string') form.append('seo_link', body.seo_link)
    if (typeof body?.raid_time === 'number') form.append('raid_time', String(body.raid_time))

    const resp = await axios.put(`${API_BASE_URL}/api/maps/id/${id}`, form, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
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
