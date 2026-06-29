import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { rateLimit, getRateLimitKey, LIMITS } from '@/lib/ratelimit'

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('user_id')
  if (!userId) return Response.json({ error: 'user_id required' }, { status: 400 })

  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
    if (error) throw error
    return Response.json({ data })
  } catch (err) {
    console.error('[/api/portfolio GET]', err)
    return Response.json({ error: 'Failed to load portfolio.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const rl = rateLimit(getRateLimitKey(request, 'portfolio'), LIMITS.general)
  if (!rl.allowed) return Response.json({ error: 'Too many requests.' }, { status: 429 })

  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized.' }, { status: 401 })

    const { data: profile } = await supabase
      .from('users').select('role').eq('id', user.id).single()
    if (profile?.role !== 'provider') {
      return Response.json({ error: 'Only providers can upload portfolio images.' }, { status: 403 })
    }

    const { count } = await supabase
      .from('portfolio_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
    if ((count ?? 0) >= 12) {
      return Response.json({ error: 'Maximum 12 portfolio images allowed.' }, { status: 400 })
    }

    const formData  = await request.formData()
    const imageFile = formData.get('image') as File | null
    const caption   = (formData.get('caption') as string | null) ?? ''
    const sortOrder = parseInt((formData.get('sort_order') as string) ?? '0', 10)

    if (!imageFile) return Response.json({ error: 'No image provided.' }, { status: 400 })

    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(imageFile.type)) {
      return Response.json({ error: 'Only JPEG, PNG, or WebP images allowed.' }, { status: 400 })
    }
    if (imageFile.size > 5 * 1024 * 1024) {
      return Response.json({ error: 'Image must be under 5MB.' }, { status: 400 })
    }

    const ext  = imageFile.name.split('.').pop() ?? 'jpg'
    const path = `${user.id}/${Date.now()}.${ext}`

    const { error: upErr } = await supabase.storage
      .from('portfolio')
      .upload(path, imageFile, { contentType: imageFile.type })
    if (upErr) throw upErr

    const imageUrl = supabase.storage.from('portfolio').getPublicUrl(path).data.publicUrl

    const { data: item, error: insertErr } = await supabase
      .from('portfolio_items')
      .insert({
        user_id:    user.id,
        image_url:  imageUrl,
        caption:    caption.trim() || null,
        sort_order: isNaN(sortOrder) ? 0 : sortOrder,
      })
      .select()
      .single()
    if (insertErr) throw insertErr

    return Response.json({ data: item }, { status: 201 })
  } catch (err) {
    console.error('[/api/portfolio POST]', err)
    return Response.json({ error: 'Failed to upload image.' }, { status: 500 })
  }
}
