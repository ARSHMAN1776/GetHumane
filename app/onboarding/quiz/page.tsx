'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, ChevronRight, RotateCcw, ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'

// ── Quiz data ────────────────────────────────────────────────────────────────

const QUESTIONS = [
  {
    id: 'situation',
    question: 'What best describes your current situation?',
    options: [
      { label: 'My job was automated / replaced by AI',       tags: ['reskilling','career-pivot','job-search'] },
      { label: 'I want to learn a new skill or hobby',        tags: ['learning','creative','personal-growth'] },
      { label: 'I need help with a task or project at home',  tags: ['practical','home','short-term'] },
      { label: 'I\'m exploring self-employment / freelancing', tags: ['entrepreneurship','business','money'] },
    ],
  },
  {
    id: 'interest',
    question: 'Which area interests you most?',
    options: [
      { label: 'Creative (music, art, photography, writing)',          tags: ['creative','music','art','photography','writing'] },
      { label: 'Body & Wellness (fitness, yoga, dance, martial arts)', tags: ['fitness','health','wellness','dance','martial'] },
      { label: 'Food & Home (cooking, baking, gardening, repair)',     tags: ['cooking','baking','home','gardening','repair'] },
      { label: 'Mind & Career (languages, tutoring, coaching, coding)',tags: ['learning','languages','tech','business','personal-growth'] },
    ],
  },
  {
    id: 'lifestyle',
    question: 'Which of these best matches your lifestyle right now?',
    options: [
      { label: 'Parent / family focus — activities for me or my kids', tags: ['kids','family','parenting'] },
      { label: 'Building a side income from my existing skills',        tags: ['entrepreneurship','money','business'] },
      { label: 'Getting physically active or improving my health',      tags: ['fitness','sports','wellness','health'] },
      { label: 'Learning something entirely new for personal joy',      tags: ['creative','learning','personal-growth'] },
    ],
  },
  {
    id: 'pace',
    question: 'How quickly do you want to get started?',
    options: [
      { label: 'Right now — I want to book a session today', tags: ['urgent','immediate'] },
      { label: 'This week — I\'m ready to start soon',       tags: ['soon','motivated'] },
      { label: 'Exploring — I\'m researching my options',    tags: ['exploring','flexible'] },
      { label: 'Long-term — I want to build a new career',   tags: ['career-pivot','long-term','reskilling'] },
    ],
  },
  {
    id: 'budget',
    question: 'What\'s your rough budget per session?',
    options: [
      { label: 'Under $25 — keeping it affordable',  tags: ['budget'] },
      { label: '$25–$50 — fair rate for good help',  tags: ['mid-range'] },
      { label: '$50–$100 — quality matters to me',   tags: ['premium'] },
      { label: 'No budget in mind yet',              tags: [] },
    ],
  },
]

// Map tags → suggested skill searches (covers every real-world human skill)
const TAG_TO_SKILLS: Record<string, string[]> = {
  // Creative
  'creative':         ['Guitar', 'Painting', 'Photography', 'Piano', 'Drawing', 'Singing'],
  'music':            ['Guitar', 'Piano', 'Drums', 'Singing', 'Violin', 'Bass Guitar', 'Ukulele'],
  'art':              ['Painting', 'Drawing', 'Watercolour', 'Sketching', 'Calligraphy', 'Pottery'],
  'photography':      ['Photography', 'Photo Editing', 'Videography', 'Lightroom'],
  'writing':          ['Creative Writing', 'Copywriting', 'Poetry', 'Blogging', 'Storytelling'],

  // Body & Wellness
  'fitness':          ['Fitness Training', 'Yoga', 'Pilates', 'HIIT', 'Strength Training', 'Running Coaching'],
  'health':           ['Yoga', 'Nutrition', 'Meditation', 'Cooking', 'Wellness Coaching'],
  'wellness':         ['Yoga', 'Meditation', 'Massage Therapy', 'Mindfulness', 'Breathwork'],
  'dance':            ['Salsa Dancing', 'Ballet', 'Hip Hop Dance', 'Ballroom Dancing', 'Tango', 'Contemporary Dance'],
  'martial':          ['Karate', 'Judo', 'Boxing', 'Brazilian Jiu-Jitsu', 'Taekwondo', 'Self-Defence'],
  'sports':           ['Tennis Coaching', 'Swimming Lessons', 'Football Coaching', 'Golf Lessons', 'Cycling', 'Basketball'],

  // Food & Home
  'cooking':          ['Cooking', 'Baking', 'Meal Prep', 'Nutrition', 'Vegan Cooking', 'Pastry'],
  'baking':           ['Baking', 'Cake Decorating', 'Bread Making', 'Pastry', 'Sourdough'],
  'home':             ['Home Repair', 'Cleaning & Organising', 'Interior Decorating', 'Carpentry', 'DIY'],
  'gardening':        ['Gardening', 'Plant Care', 'Composting', 'Vegetable Growing', 'Landscape Design'],
  'repair':           ['Home Repair', 'Plumbing Basics', 'Carpentry', 'Painting & Decorating', 'Electrical Basics'],
  'practical':        ['Home Repair', 'Cooking', 'Gardening', 'Woodworking', 'Automotive Care', 'Sewing'],

  // Mind & Career
  'learning':         ['Maths Tutoring', 'Language Learning', 'Chess', 'Science Tutoring', 'English Tutoring'],
  'languages':        ['Spanish', 'French', 'Arabic', 'Chinese (Mandarin)', 'Hindi', 'German', 'Italian', 'Japanese'],
  'tech':             ['Coding', 'Web Design', 'Digital Marketing', 'Data Analysis', 'App Development'],
  'coding':           ['Python', 'Web Development', 'JavaScript', 'App Building', 'SQL', 'Graphic Design'],
  'design':           ['Graphic Design', 'Web Design', 'UI/UX Design', 'Canva', 'Logo Design'],
  'digital':          ['Social Media Management', 'Digital Marketing', 'Content Writing', 'SEO', 'TikTok Strategy'],
  'business':         ['Business Coaching', 'Marketing', 'Bookkeeping', 'Entrepreneurship Coaching'],
  'personal-growth':  ['Life Coaching', 'Public Speaking', 'Time Management', 'Confidence Coaching'],

  // Career transitions
  'reskilling':       ['Coding', 'Digital Marketing', 'Data Analysis', 'Graphic Design', 'Bookkeeping'],
  'career-pivot':     ['Business Coaching', 'Resume Writing', 'Interview Prep', 'LinkedIn Coaching'],
  'entrepreneurship': ['Business Coaching', 'Marketing', 'Bookkeeping', 'Pitch Coaching'],
  'job-search':       ['Resume Writing', 'Interview Prep', 'LinkedIn Coaching', 'Career Coaching'],
  'money':            ['Budgeting & Finance', 'Bookkeeping', 'Investing Basics', 'Business Coaching'],

  // Family & Kids
  'kids':             ['Kids Art Classes', 'Children\'s Music Lessons', 'Tutoring', 'Chess for Kids', 'Kids Fitness'],
  'family':           ['Cooking', 'Gardening', 'Kids Art Classes', 'Family Fitness'],
  'parenting':        ['Parenting Coaching', 'Baby Sign Language', 'Nutrition for Kids'],
}

function getRecommendations(selected: string[][]): string[] {
  const tagCounts = new Map<string, number>()
  for (const tags of selected) {
    for (const tag of tags) {
      const skills = TAG_TO_SKILLS[tag] ?? []
      for (const skill of skills) {
        tagCounts.set(skill, (tagCounts.get(skill) ?? 0) + 1)
      }
    }
  }
  return [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([skill]) => skill)
}

// ────────────────────────────────────────────────────────────────────────────

export default function SkillQuizPage() {
  const router = useRouter()
  const [step,        setStep]        = useState(0)
  const [answers,     setAnswers]     = useState<string[][]>([])
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [done,        setDone]        = useState(false)
  const [recs,        setRecs]        = useState<string[]>([])

  const q = QUESTIONS[step]
  const total = QUESTIONS.length
  const progress = ((step) / total) * 100

  const choose = (idx: number) => {
    if (selectedIdx === idx) return
    setSelectedIdx(idx)
  }

  const next = () => {
    if (selectedIdx === null) return
    const newAnswers = [...answers, q.options[selectedIdx].tags]

    if (step + 1 >= total) {
      setRecs(getRecommendations(newAnswers))
      setDone(true)
    } else {
      setAnswers(newAnswers)
      setStep(s => s + 1)
      setSelectedIdx(null)
    }
  }

  const reset = () => {
    setStep(0); setAnswers([]); setSelectedIdx(null); setDone(false); setRecs([])
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-16">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-700 rounded-full blur-3xl opacity-10 pointer-events-none" />
        <div className="relative z-10 w-full max-w-lg text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center mx-auto mb-5">
            <Sparkles size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Your Skill Matches</h1>
          <p className="text-white/50 mb-8 leading-relaxed">
            Based on your answers, here are the skills and providers we think will help you most.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {recs.map((skill) => (
              <Link
                key={skill}
                href={`/browse?q=${encodeURIComponent(skill)}`}
                className="flex items-center gap-2.5 p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-brand-500/50 hover:bg-brand-900/30 transition-all group text-left"
              >
                <div className="w-8 h-8 rounded-xl bg-brand-600/30 flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={16} className="text-brand-400 group-hover:text-brand-300" />
                </div>
                <span className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">{skill}</span>
                <ArrowRight size={13} className="text-white/20 group-hover:text-brand-400 ml-auto transition-colors" />
              </Link>
            ))}
          </div>

          <div className="flex gap-3">
            <Link
              href="/browse"
              className="flex-1 py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#14b8a6,#0f766e)' }}
            >
              <Sparkles size={15} />
              Browse All Providers
            </Link>
            <button
              onClick={reset}
              className="px-5 py-3.5 rounded-xl border border-white/10 text-white/40 hover:text-white/70 hover:border-white/20 text-sm font-semibold transition-colors flex items-center gap-2"
            >
              <RotateCcw size={14} />
              Retake
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-16">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-700 rounded-full blur-3xl opacity-10 pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-white/60 mb-5">
            <Sparkles size={12} className="text-brand-400" />
            AI Skill Match · Step {step + 1} of {total}
          </div>
          <h1 className="text-2xl font-bold text-white">{q.question}</h1>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/10 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {q.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => choose(idx)}
              className={`w-full text-left p-4 rounded-2xl border font-semibold text-sm transition-all flex items-center gap-3 ${
                selectedIdx === idx
                  ? 'bg-brand-900/50 border-brand-500 text-white'
                  : 'bg-white/5 border-white/10 text-white/70 hover:border-white/25 hover:text-white'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                selectedIdx === idx ? 'border-brand-400 bg-brand-500' : 'border-white/25'
              }`}>
                {selectedIdx === idx && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              {opt.label}
            </button>
          ))}
        </div>

        {/* Next */}
        <button
          onClick={next}
          disabled={selectedIdx === null}
          className="w-full py-4 rounded-xl font-bold text-white text-base flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg,#14b8a6,#0f766e)' }}
        >
          {step + 1 === total ? 'See My Matches' : 'Next'}
          <ChevronRight size={18} />
        </button>

        <p className="text-center text-xs text-white/20 mt-4">
          No account needed. Your answers stay on your device.
        </p>
      </div>
    </div>
  )
}
