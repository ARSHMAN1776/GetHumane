/**
 * POST /api/providers/match
 * AI skill matching — returns providers ranked by relevance to a natural-language query.
 *
 * Uses TF-IDF cosine similarity over skill names + descriptions.
 * Architecture: drop in OpenAI text-embedding-3-small here later by replacing `scoreProvider`.
 *
 * Body: { query: string, city?: string, limit?: number }
 */
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { rateLimit, getRateLimitKey, LIMITS } from '@/lib/ratelimit'
import { z } from 'zod'

const MatchSchema = z.object({
  query: z.string().min(2).max(500),
  city:  z.string().optional(),
  limit: z.number().int().min(1).max(50).default(12),
})

// ── TF-IDF helpers ────────────────────────────────────────────────────────────

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2)
}

const STOP_WORDS = new Set([
  'the','and','for','are','but','not','you','all','any','can',
  'her','was','one','our','out','day','get','has','him','his',
  'how','its','may','now','off','per','put','set','too','via',
  'who','with','that','this','from','have','will','been','were',
  'they','than','then','them','what','when','your','also','into',
])

function removeStopWords(tokens: string[]): string[] {
  return tokens.filter(t => !STOP_WORDS.has(t))
}

type TermFreq = Map<string, number>

function buildTF(tokens: string[]): TermFreq {
  const tf: TermFreq = new Map()
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1)
  const max = Math.max(...tf.values())
  tf.forEach((v, k) => tf.set(k, v / max))
  return tf
}

function cosineSimilarity(a: TermFreq, b: TermFreq): number {
  let dot = 0, normA = 0, normB = 0
  a.forEach((v, k) => {
    normA += v * v
    const bv = b.get(k) ?? 0
    dot += v * bv
  })
  b.forEach(v => { normB += v * v })
  if (normA === 0 || normB === 0) return 0
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

function scoreText(queryTF: TermFreq, providerText: string): number {
  const tokens = removeStopWords(tokenize(providerText))
  if (!tokens.length) return 0
  return cosineSimilarity(queryTF, buildTF(tokens))
}

// ─────────────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const rl = rateLimit(getRateLimitKey(request, 'match'), LIMITS.general)
  if (!rl.allowed) return Response.json({ error: 'Too many requests.' }, { status: 429 })

  try {
    const body   = await request.json()
    const parsed = MatchSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { query, city, limit } = parsed.data

    const queryTokens = removeStopWords(tokenize(query))
    if (!queryTokens.length) {
      return Response.json({ error: 'Query too generic — please be more specific.' }, { status: 400 })
    }
    const queryTF = buildTF(queryTokens)

    const supabase = await createServerClient()
    let dbQuery = supabase
      .from('users')
      .select('id,full_name,photo_url,city,bio,is_verified,skills(*)')
      .eq('role', 'provider')

    if (city) dbQuery = dbQuery.ilike('city', `%${city}%`)

    const { data: providers } = await dbQuery.limit(200)
    if (!providers?.length) {
      return Response.json({ data: [] })
    }

    const scored = providers.map(p => {
      const skills = (p.skills as { skill_name: string; hourly_rate: number; description?: string }[]) ?? []
      const skillText = skills.map(s => `${s.skill_name} ${s.description ?? ''}`).join(' ')
      const providerText = `${p.full_name ?? ''} ${p.bio ?? ''} ${skillText}`

      const score = scoreText(queryTF, providerText)
      const minRate = skills.length ? Math.min(...skills.map(s => s.hourly_rate)) : null

      return { ...p, score, skills, minRate }
    })

    const results = scored
      .filter(p => p.score > 0 || !query)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ score: _, ...p }) => p)

    return Response.json({ data: results })
  } catch (err) {
    console.error('[/api/providers/match]', err)
    return Response.json({ error: 'Matching failed.' }, { status: 500 })
  }
}
