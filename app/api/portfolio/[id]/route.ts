import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'

interface Props { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Props) {
  const { id } = await params
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized.' }, { status: 401 })

    const body = await request.json()
    const updates: Record<string, unknown> = {}
    if (body.caption !== undefined) updates.caption = body.caption?.trim() || null
    if (body.sort_order !== undefined) updates.sort_order = body.sort_order

    const { data, error } = await supabase
      .from('portfolio_items')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    if (error) throw error

    return Response.json({ data })
  } catch (err) {
    console.error('[/api/portfolio/[id] PATCH]', err)
    return Response.json({ error: 'Failed to update.' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: Props) {
  const { id } = await params
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized.' }, { status: 401 })

    const { data: item, error: fetchErr } = await supabase
      .from('portfolio_items')
      .select('image_url, user_id')
      .eq('id', id)
      .single()
    if (fetchErr || !item) return Response.json({ error: 'Item not found.' }, { status: 404 })
    if (item.user_id !== user.id) return Response.json({ error: 'Forbidden.' }, { status: 403 })

    // Derive storage path from public URL: .../portfolio/{user_id}/{filename}
    const url   = new URL(item.image_url)
    const parts = url.pathname.split('/portfolio/')
    const storagePath = parts[1]
    if (storagePath) {
      await supabase.storage.from('portfolio').remove([storagePath]).catch(() => {})
    }

    const { error: delErr } = await supabase
      .from('portfolio_items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (delErr) throw delErr

    return Response.json({ data: { deleted: true } })
  } catch (err) {
    console.error('[/api/portfolio/[id] DELETE]', err)
    return Response.json({ error: 'Failed to delete.' }, { status: 500 })
  }
}
