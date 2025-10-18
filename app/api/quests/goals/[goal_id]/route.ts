import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import axios from 'axios'

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '')

export async function PUT(req: Request, { params }: { params: { goal_id: string } }) {
  const token = cookies().get('aftsess')?.value
  if (!token) {
    return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 })
  }

  const goalId = params.goal_id
  if (!goalId) {
    return NextResponse.json({ detail: 'goal_id is required' }, { status: 400 })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ detail: 'Invalid JSON' }, { status: 400 })
  }

  try {
    const resp = await axios.put(`${API_BASE_URL}/api/quests/goals/${encodeURIComponent(goalId)}`, body, {
      headers: {
        'Content-Type': 'application/json',
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

export async function DELETE(_req: Request, { params }: { params: { goal_id: string } }) {
  const token = cookies().get('aftsess')?.value
  if (!token) {
    return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 })
  }

  const goalId = params.goal_id
  if (!goalId) {
    return NextResponse.json({ detail: 'goal_id is required' }, { status: 400 })
  }

  try {
    const resp = await axios.delete(`${API_BASE_URL}/api/quests/goals/${encodeURIComponent(goalId)}`, {
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

