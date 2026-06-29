import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — GetHumane',
  description: 'How GetHumane collects, uses, and protects your personal data.',
}

const EFFECTIVE = 'January 1, 2025'

export default function PrivacyPage() {
  return (
    <div className="container-app py-20 max-w-3xl mx-auto">
      <div className="mb-10">
        <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">Legal</span>
        <h1 className="text-4xl font-bold text-gray-900 mt-2 mb-3">Privacy Policy</h1>
        <p className="text-gray-500 text-sm">Effective date: {EFFECTIVE}</p>
      </div>

      <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">1. What We Collect</h2>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li><strong>Account data:</strong> name, email address, password (hashed), city, profile photo, and optional phone number.</li>
            <li><strong>Provider data:</strong> skills, hourly rates, bio, identity verification status (pass/fail — we do not store raw ID documents).</li>
            <li><strong>Booking data:</strong> session date/time, skill type, price, status.</li>
            <li><strong>Communication data:</strong> in-app messages between Providers and Seekers.</li>
            <li><strong>Safety data:</strong> panic button events (timestamp, GPS point if permission granted), emergency contact phone number.</li>
            <li><strong>Payment data:</strong> Stripe handles card processing. We store only transaction IDs and booking amounts — never raw card numbers.</li>
            <li><strong>Usage data:</strong> page views, session duration, and feature usage (collected via privacy-friendly analytics).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Your Data</h2>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            {[
              'To create and manage your account.',
              'To facilitate bookings between Providers and Seekers.',
              'To process payments securely via Stripe.',
              'To send transactional emails (booking confirmations, receipts, safety alerts).',
              'To display your public profile to other users.',
              'To operate the panic button and contact your emergency contact if activated.',
              'To detect and prevent fraud, abuse, and Terms violations.',
              'To improve the platform through aggregated, anonymised analytics.',
            ].map((item) => <li key={item}>{item}</li>)}
          </ul>
          <p className="mt-4">We do <strong>not</strong> sell your personal data. We do not use your data for targeted advertising.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">3. Who Can See Your Data</h2>
          <p><strong>Public profile:</strong> Your name, photo, city, bio, skills, rating, and verified status are visible to all users.</p>
          <p className="mt-3"><strong>Booking parties:</strong> When you book or are booked, the other party can see your name and photo. Messages between booking parties are private.</p>
          <p className="mt-3"><strong>Admin team:</strong> Authorised GetHumane staff can access account data to resolve disputes and safety issues.</p>
          <p className="mt-3"><strong>Third-party providers:</strong> We share minimal data with Supabase (database & auth), Stripe (payments & identity verification), Resend (transactional email), and Twilio (SMS for panic events). Each is bound by their own privacy policies and data processing agreements.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">4. Data Retention</h2>
          <p>Account data is retained for as long as your account is active. If you delete your account, we delete your personal data within 30 days, except where we are required to retain it for legal or fraud-prevention purposes (e.g., payment records for up to 7 years).</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">5. Your Rights</h2>
          <p>Depending on your jurisdiction, you may have rights to:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            {[
              'Access the personal data we hold about you.',
              'Correct inaccurate data.',
              'Request deletion of your data.',
              'Object to or restrict certain processing.',
              'Export your data in a portable format.',
            ].map((item) => <li key={item}>{item}</li>)}
          </ul>
          <p className="mt-4">To exercise any of these rights, email <a href="mailto:privacy@gethumane.com" className="text-brand-600 hover:underline">privacy@gethumane.com</a>. We will respond within 30 days.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">6. Cookies</h2>
          <p>We use strictly necessary cookies for authentication (Supabase session tokens) and functional cookies to remember preferences. We do not use tracking or advertising cookies.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">7. Children's Privacy</h2>
          <p>GetHumane is not intended for users under 18. We do not knowingly collect data from minors. If you believe a minor has registered, contact us immediately at <a href="mailto:privacy@gethumane.com" className="text-brand-600 hover:underline">privacy@gethumane.com</a>.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">8. Security</h2>
          <p>We implement industry-standard security practices: all data is encrypted in transit (TLS 1.3), passwords are hashed by Supabase Auth (bcrypt), and our database enforces Row Level Security policies so users can only access their own data.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">9. Changes to This Policy</h2>
          <p>Material changes will be communicated via email or in-app notification at least 14 days before they take effect.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">10. Contact</h2>
          <p>Privacy questions: <a href="mailto:privacy@gethumane.com" className="text-brand-600 hover:underline">privacy@gethumane.com</a></p>
          <p className="mt-2">GetHumane Inc., 1234 Example Ave, Wilmington, DE 19801, USA</p>
        </section>

      </div>

      <div className="mt-14 pt-8 border-t border-gray-100 flex items-center justify-between">
        <Link href="/terms" className="text-sm text-brand-600 hover:underline font-medium">Terms of Service →</Link>
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-700">← Back to Home</Link>
      </div>
    </div>
  )
}
