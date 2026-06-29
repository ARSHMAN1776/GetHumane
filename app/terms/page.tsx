import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service — GetHumane',
  description: 'GetHumane Terms of Service. Read before using the platform.',
}

const EFFECTIVE = 'January 1, 2025'

export default function TermsPage() {
  return (
    <div className="container-app py-20 max-w-3xl mx-auto">
      <div className="mb-10">
        <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">Legal</span>
        <h1 className="text-4xl font-bold text-gray-900 mt-2 mb-3">Terms of Service</h1>
        <p className="text-gray-500 text-sm">Effective date: {EFFECTIVE}</p>
      </div>

      <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
          <p>By creating an account or using the GetHumane platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the Service.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">2. The GetHumane Platform</h2>
          <p>GetHumane is a marketplace that connects Skill Providers ("Providers") with Skill Seekers ("Seekers"). We facilitate discovery and booking; we are not a party to the sessions that occur between users. GetHumane does not employ Providers and does not guarantee the quality, safety, or outcome of any session.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">3. Eligibility</h2>
          <p>You must be at least 18 years old to use GetHumane. By registering, you confirm that you are 18 or older and that the information you provide is accurate and truthful.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">4. Public Meetups Only</h2>
          <p>All sessions booked through GetHumane must take place in a publicly accessible location (coffee shop, library, park, community centre, etc.). Arranging sessions at private residences is strictly prohibited and may result in immediate account termination.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">5. Payments & Fees</h2>
          <p>GetHumane charges a 10% platform fee on completed bookings, deducted from the Provider's payout. Payments are processed securely by Stripe. We do not store card details. All prices are listed in USD.</p>
          <p className="mt-3">Refunds for cancelled bookings are subject to the cancellation policy active at the time of booking. Disputed sessions are reviewed by our safety team before any refund is issued.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">6. Prohibited Conduct</h2>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            {[
              'Arranging private meetups outside the platform',
              'Exchanging personal contact information before or instead of booking',
              'Engaging in any form of harassment, discrimination, or abuse',
              'Misrepresenting your skills, identity, or qualifications',
              'Using the panic button frivolously or as a prank',
              'Attempting to circumvent platform fees',
              'Creating fake reviews or incentivising reviews',
            ].map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">7. Identity Verification</h2>
          <p>Providers may voluntarily complete identity verification via Stripe Identity. Verified status indicates that Stripe successfully verified the individual's government-issued ID at the time of verification. It does not constitute an endorsement, background check, or guarantee of conduct.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">8. Safety Features</h2>
          <p>GetHumane provides an in-app panic button for use during active sessions. Pressing it sends an alert to our safety team and the user's nominated emergency contact. This feature supplements, but does not replace, contacting local emergency services (911 or equivalent).</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">9. Reviews</h2>
          <p>Both Providers and Seekers may leave one review per completed booking. Reviews must reflect genuine experiences. GetHumane reserves the right to remove reviews that violate community standards.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">10. Termination</h2>
          <p>GetHumane may suspend or terminate accounts that violate these Terms, at our sole discretion and without prior notice. Active bookings may be cancelled with a full refund to the Seeker in such cases.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">11. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, GetHumane is not liable for any indirect, incidental, or consequential damages arising from your use of the Service, including any harm that occurs during in-person meetups. Your use of the Service is at your own risk.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">12. Governing Law</h2>
          <p>These Terms are governed by the laws of the State of Delaware, USA, without regard to conflict-of-law principles.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">13. Changes to Terms</h2>
          <p>We may update these Terms from time to time. Material changes will be communicated via email or in-app notification at least 14 days before they take effect. Continued use of the Service after that date constitutes acceptance of the updated Terms.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">14. Contact</h2>
          <p>Questions about these Terms? Email us at <a href="mailto:legal@gethumane.com" className="text-brand-600 hover:underline">legal@gethumane.com</a>.</p>
        </section>

      </div>

      <div className="mt-14 pt-8 border-t border-gray-100 flex items-center justify-between">
        <Link href="/privacy" className="text-sm text-brand-600 hover:underline font-medium">Privacy Policy →</Link>
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-700">← Back to Home</Link>
      </div>
    </div>
  )
}
