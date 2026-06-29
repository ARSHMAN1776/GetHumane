import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const PASSWORD = 'GetHumane123!'

async function upsertAuthUser(email, fullName, role) {
  const { data, error } = await sb.auth.admin.createUser({
    email, password: PASSWORD, email_confirm: true,
    user_metadata: { full_name: fullName, role },
  })
  if (error?.message?.toLowerCase().includes('already')) {
    const { data: list } = await sb.auth.admin.listUsers()
    return list.users.find(u => u.email === email).id
  }
  if (error) throw new Error(error.message)
  return data.user.id
}

async function main() {
  console.log('\n🌱  Seeding demo accounts...\n')

  // ── 1. Auth users ──────────────────────────────────────────────────────────
  const providerId = await upsertAuthUser('provider@demo.gethumane.com', 'Sofia Rivera',  'provider')
  console.log('  ✓ provider:', providerId.slice(0,8))
  const seekerId   = await upsertAuthUser('seeker@demo.gethumane.com',   'James Okafor', 'seeker')
  console.log('  ✓ seeker:  ', seekerId.slice(0,8))
  const adminId    = await upsertAuthUser('admin@demo.gethumane.com',     'Admin User',   'seeker')
  console.log('  ✓ admin:   ', adminId.slice(0,8))

  // ── 2. User profiles ───────────────────────────────────────────────────────
  await sb.from('users').upsert([
    { id: providerId, email: 'provider@demo.gethumane.com', full_name: 'Sofia Rivera',
      role: 'provider', city: 'Austin, TX', is_verified: true,
      bio: 'Professional guitar teacher & yoga instructor with 8 years experience. I lost my studio job to automation in 2024 — now I teach real people in real spaces.',
      photo_url: 'https://api.dicebear.com/8.x/avataaars/svg?seed=SofiaRivera' },
    { id: seekerId, email: 'seeker@demo.gethumane.com', full_name: 'James Okafor',
      role: 'seeker', city: 'Austin, TX', is_verified: false,
      photo_url: 'https://api.dicebear.com/8.x/avataaars/svg?seed=JamesOkafor' },
    { id: adminId, email: 'admin@demo.gethumane.com', full_name: 'Admin User',
      role: 'seeker', city: 'San Francisco, CA', is_verified: false },
  ], { onConflict: 'id' })
  console.log('  ✓ profiles upserted')

  // ── 3. Skills ──────────────────────────────────────────────────────────────
  await sb.from('skills').delete().eq('user_id', providerId)
  const { data: skills } = await sb.from('skills').insert([
    { user_id: providerId, skill_name: 'Guitar Lessons',  hourly_rate: 45, description: 'Beginner to intermediate. Learn your favourite songs in the first session.' },
    { user_id: providerId, skill_name: 'Yoga & Wellness', hourly_rate: 40, description: 'Hatha and Vinyasa for all levels. Stress relief and mindfulness.' },
    { user_id: providerId, skill_name: 'Music Theory',    hourly_rate: 35, description: 'Chords, scales, ear training and reading sheet music.' },
  ]).select('id')
  console.log('  ✓ skills:', skills.length)

  // ── 4. Bookings (use actual DB columns) ────────────────────────────────────
  await sb.from('bookings').delete().eq('provider_id', providerId).eq('seeker_id', seekerId)
  const now = Date.now()
  const { data: bookings } = await sb.from('bookings').insert([
    { provider_id: providerId, seeker_id: seekerId,
      date_time: new Date(now - 14*86400000).toISOString(),
      location: 'Epoch Coffee, Austin TX', status: 'completed',
      total_price: 45, is_public_meetup: true, message: 'First guitar lesson — total beginner.' },
    { provider_id: providerId, seeker_id: seekerId,
      date_time: new Date(now - 7*86400000).toISOString(),
      location: 'Epoch Coffee, Austin TX', status: 'completed',
      total_price: 45, is_public_meetup: true, message: 'Second session — working on chords.' },
    { provider_id: providerId, seeker_id: seekerId,
      date_time: new Date(now + 3*86400000).toISOString(),
      location: 'Zilker Park, Austin TX', status: 'confirmed',
      total_price: 40, is_public_meetup: true, message: 'Morning yoga session.' },
    { provider_id: providerId, seeker_id: seekerId,
      date_time: new Date(now + 10*86400000).toISOString(),
      location: 'Epoch Coffee, Austin TX', status: 'pending',
      total_price: 45, is_public_meetup: true, message: null },
  ]).select('id,status')
  console.log('  ✓ bookings:', bookings.length)

  // ── 5. Reviews on completed bookings ──────────────────────────────────────
  const completed = bookings.filter(b => b.status === 'completed')
  await sb.from('reviews').delete().in('booking_id', completed.map(b => b.id))
  await sb.from('reviews').insert([
    { booking_id: completed[0].id, reviewer_id: seekerId, reviewee_id: providerId,
      rating: 5, comment: 'Sofia is incredible — patient, structured, and genuinely passionate. Learned more in one hour than months of YouTube videos.' },
    { booking_id: completed[1].id, reviewer_id: seekerId, reviewee_id: providerId,
      rating: 5, comment: 'Second session was even better. She completely customised the lesson to what I wanted. Highly recommend.' },
  ])
  console.log('  ✓ reviews: 2')

  // ── 6. Waitlist entries ───────────────────────────────────────────────────
  await sb.from('waitlist').upsert([
    { email: 'alice@example.com' }, { email: 'bob@example.com' },
    { email: 'carol@example.com' }, { email: 'dave@example.com' },
    { email: 'eva@example.com'  }, { email: 'frank@example.com' },
  ], { onConflict: 'email', ignoreDuplicates: true })
  console.log('  ✓ waitlist entries added')

  console.log(`
╔══════════════════════════════════════════════════════╗
║           GetHumane — Demo Credentials               ║
╠══════════════════════════════════════════════════════╣
║  PROVIDER  provider@demo.gethumane.com               ║
║  SEEKER    seeker@demo.gethumane.com                 ║
║  ADMIN     admin@demo.gethumane.com                  ║
║  PASSWORD  GetHumane123!  (all accounts)             ║
╠══════════════════════════════════════════════════════╣
║  Admin panel → /admin                                ║
║  (add admin@demo.gethumane.com to ADMIN_EMAILS env)  ║
╚══════════════════════════════════════════════════════╝
`)
}

main().catch(e => { console.error('❌', e.message); process.exit(1) })
