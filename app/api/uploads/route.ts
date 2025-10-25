import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import axios from 'axios'
import FormData from 'form-data'

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '')

export async function POST(req: Request) {
  const token = cookies().get('aftsess')?.value
  if (!token) {
    return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 })
  }
  try {
    const form = await req.formData()
    const file = form.get('file') as unknown as File | null
    const name = (form.get('name') as string | null) || ''
    if (!file) {
      return NextResponse.json({ detail: 'file is required' }, { status: 400 })
    }

    const originalName = (file as any).name as string | undefined
    const contentType = (file as any).type as string | undefined
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const fd = new FormData()
    fd.append('file', buffer, {
      filename: originalName || 'upload.bin',
      contentType: contentType || 'application/octet-stream',
      knownLength: buffer.length,
    })
    if (name) fd.append('name', name)

    const resp = await axios.post(`${API_BASE_URL}/api/images/upload`, fd, {
      headers: {
        ...fd.getHeaders(),
        Authorization: `Bearer ${token}`,
      },
      maxBodyLength: Infinity,
      validateStatus: () => true,
    })
    return NextResponse.json(resp.data, { status: resp.status })
  } catch (e: any) {
    const status = e?.response?.status ?? 500
    const detail = e?.response?.data?.detail || e?.message || 'Upload failed'
    return NextResponse.json({ detail }, { status })
  }
}
