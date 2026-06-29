'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

const FAQS: FAQItem[] = [
  {
    question: 'How does provider verification work?',
    answer: 'We verify government-issued photo IDs and conduct background screenings. Providers also submit references, certifications, and portfolio work to verify their expertise before being listed.',
  },
  {
    question: 'Is my payment secure on GetHumane?',
    answer: 'Yes, all payments are securely processed via Stripe. Funds are held safely and only released to the provider after the session is completed and confirmed by both parties.',
  },
  {
    question: 'Can I offer multiple skills at the same time?',
    answer: 'Absolutely! You can add and configure multiple skills on a single profile. Each skill can have its own hourly rate, specific description, and separate portfolio images.',
  },
  {
    question: 'Are sessions conducted in-person or virtually?',
    answer: 'It depends entirely on the skill and provider. Many offer virtual tutoring, while others specialize in local in-person meetups. You can coordinate details via our built-in chat.',
  },
]

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-3">
      {FAQS.map((faq, i) => {
        const isOpen = openIndex === i
        return (
          <div
            key={i}
            className="border border-gray-200 rounded-xl bg-white overflow-hidden transition-colors"
          >
            <button
              onClick={() => toggle(i)}
              className="w-full px-5 py-4 flex items-center justify-between text-left font-bold text-gray-900 text-sm sm:text-base hover:bg-gray-50/80 transition-colors cursor-pointer"
            >
              <span>{faq.question}</span>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand-600' : ''}`}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-4 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                {faq.answer}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
