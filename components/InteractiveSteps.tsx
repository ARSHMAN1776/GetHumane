'use client'

import { useState } from 'react'
import { Search, Calendar, MessageSquare, Check, ArrowRight, Star } from 'lucide-react'

const steps = [
  {
    id: 'step-1',
    num: '01',
    title: 'Find a local skill',
    desc: 'Filter verified teachers, helper hands, and creatives in your neighborhood by skill name, pricing, or ratings.',
    icon: Search,
  },
  {
    id: 'step-2',
    num: '02',
    title: 'Confirm dates & book',
    desc: 'Select available time slots from their custom availability schedule and pay securely through integrated Stripe.',
    icon: Calendar,
  },
  {
    id: 'step-3',
    num: '03',
    title: 'Meet & get things done',
    desc: 'Coordinate a safe public meetup place or virtual call through our chat. Your trust score builds with every successful session.',
    icon: MessageSquare,
  },
]

export default function InteractiveSteps() {
  const [activeStep, setActiveStep] = useState(0)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="grid lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
      {/* Left side: Navigation tabs */}
      <div className="lg:col-span-6 space-y-4">
        {steps.map((s, idx) => {
          const isActive = activeStep === idx
          const Icon = s.icon
          return (
            <div
              key={s.id}
              onClick={() => setActiveStep(idx)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer text-left ${
                isActive
                  ? 'border-brand-500 bg-brand-50/10'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                    isActive
                      ? 'bg-brand-600 border-brand-600 text-white'
                      : 'bg-gray-50 border-gray-200 text-gray-500'
                  }`}
                >
                  <Icon size={18} />
                </div>
                <div>
                  <span className={`text-[10px] font-extrabold tracking-widest uppercase ${isActive ? 'text-brand-700' : 'text-gray-400'}`}>
                    Step {s.num}
                  </span>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base mt-0.5">{s.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mt-2">{s.desc}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Right side: Interactive Visual Simulator */}
      <div className="lg:col-span-6 bg-gray-50 border border-gray-200 rounded-2xl p-5 min-h-[300px] flex flex-col justify-between">
        
        {/* Step 1 Preview - Simulated Search */}
        {activeStep === 0 && (
          <div className="space-y-4 animate-fade-in">
            <p className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Simulated Search</p>
            <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-2">
              <Search size={14} className="text-gray-400" />
              <input
                type="text"
                placeholder="Type 'guitar' or 'cooking'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs text-gray-800 bg-transparent outline-none"
              />
            </div>
            <div className="space-y-2">
              {['Sarah K. · Guitar Lessons', 'David L. · Cooking Classes'].map((p) => {
                const queryMatch = searchQuery === '' || p.toLowerCase().includes(searchQuery.toLowerCase())
                if (!queryMatch) return null
                return (
                  <div key={p} className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between text-xs font-semibold text-gray-800">
                    <span className="truncate">{p}</span>
                    <span className="text-[10px] text-brand-700 font-extrabold bg-brand-50 border border-brand-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      4.9★
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 2 Preview - Simulated Calendar */}
        {activeStep === 1 && (
          <div className="space-y-4 animate-fade-in">
            <p className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Select Time Slot</p>
            <div className="grid grid-cols-3 gap-2">
              {['Mon 10:00 AM', 'Tue 02:00 PM', 'Thu 11:30 AM', 'Fri 04:00 PM', 'Sat 09:00 AM', 'Sun 01:00 PM'].map((slot) => {
                const isSelected = selectedSlot === slot
                return (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-2.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-brand-600 border-brand-600 text-white'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-brand-300'
                    }`}
                  >
                    {slot}
                  </button>
                )
              })}
            </div>
            {selectedSlot && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center gap-2 text-emerald-800 text-[11px] font-bold">
                <Check size={14} className="text-emerald-600" />
                <span>Slot selected: {selectedSlot} · Ready to checkout</span>
              </div>
            )}
          </div>
        )}

        {/* Step 3 Preview - Simulated Chat */}
        {activeStep === 2 && (
          <div className="space-y-4 animate-fade-in flex-1 flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider mb-3">Simulated In-App Chat</p>
              <div className="space-y-2">
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-800 text-xs rounded-xl rounded-tl-none px-3.5 py-2 max-w-[80%]">
                    Hi! Should we meet at the community library or online?
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-brand-600 text-white text-xs rounded-xl rounded-tr-none px-3.5 py-2 max-w-[80%]">
                    Let's meet at the library table 3. See you at 10 AM!
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-brand-50 border border-brand-100 rounded-xl p-3 mt-4 text-[10px] font-bold text-brand-800 flex items-center justify-between">
              <span>📍 Meetup verified: Public Space Recommended</span>
              <span className="text-emerald-700">Online</span>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="mt-6 pt-4 border-t border-gray-200/80 flex items-center justify-between">
          <span className="text-[10px] text-gray-400 font-semibold">Interactive Demo Simulator</span>
          <button
            onClick={() => setActiveStep((prev) => (prev + 1) % 3)}
            className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-0.5 cursor-pointer"
          >
            Next Step <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}
