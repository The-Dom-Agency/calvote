import Link from 'next/link'
import { Logo } from '@/components/Logo'

export const metadata = {
  title: 'Privacy Policy — calvote',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-8 py-5 border-b border-[#E5E7EB]">
        <Link href="/"><Logo /></Link>
        <Link href="/login" className="px-5 py-2.5 rounded-lg text-sm font-semibold text-[#1C2B3A] border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors">
          Log in
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-[#1C2B3A] mb-2">Privacy Policy</h1>
        <p className="text-sm text-[#9CA3AF] mb-12">Last updated: April 13, 2026</p>

        <div className="prose prose-slate max-w-none space-y-10 text-[#374151] leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">1. Introduction</h2>
            <p>calvote (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates calvote.ai, a smart scheduling platform. This Privacy Policy explains how we collect, use, and protect your information when you use our service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">2. Information We Collect</h2>
            <p className="mb-3"><strong>Account information:</strong> When you sign in with Google, we receive your name, email address, and profile picture from Google.</p>
            <p className="mb-3"><strong>Calendar data:</strong> If you connect Google Calendar, we access your calendar events and availability solely to enable scheduling features. We do not store the content of your calendar events.</p>
            <p className="mb-3"><strong>Usage data:</strong> We collect information about how you use the platform, including meetings scheduled and features accessed.</p>
            <p><strong>Contact information:</strong> Phone numbers you or your invitees provide for SMS reminders.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To provide and operate the scheduling service</li>
              <li>To read your Google Calendar availability and schedule meetings on your behalf</li>
              <li>To send SMS reminders via Twilio to you and your invitees</li>
              <li>To manage your account, plan, and usage</li>
              <li>To improve and develop the platform</li>
              <li>To communicate important service updates</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">4. Google API Usage</h2>
            <p className="mb-3">calvote's use of information received from Google APIs adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy" className="text-[#1A5C52] underline" target="_blank" rel="noopener noreferrer">Google API Services User Data Policy</a>, including the Limited Use requirements.</p>
            <p>We use Google Calendar data only to display your availability and create calendar events. We do not use this data for advertising, sell it to third parties, or use it for any purpose unrelated to scheduling.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">5. Third-Party Services</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Firebase (Google):</strong> Authentication and database storage</li>
              <li><strong>Google Calendar API:</strong> Calendar access and event creation</li>
              <li><strong>Twilio:</strong> SMS notifications and reminders</li>
              <li><strong>Vercel:</strong> Application hosting and infrastructure</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">6. Data Retention</h2>
            <p>We retain your account data for as long as your account is active. Calendar tokens are stored securely and can be revoked at any time from your Google Account settings or within calvote. You may request deletion of your account and data by contacting us.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">7. Data Security</h2>
            <p>We use industry-standard security measures including encrypted connections (HTTPS), Firebase security rules, and secure token storage. We never store Google account passwords.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">8. Your Rights</h2>
            <p>You may disconnect Google Calendar access at any time. You may request access to, correction of, or deletion of your personal data by contacting us at <a href="mailto:hello@calvote.ai" className="text-[#1A5C52] underline">hello@calvote.ai</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">9. Children&apos;s Privacy</h2>
            <p>calvote is not directed at children under 13. We do not knowingly collect personal information from children under 13.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page with an updated date.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">11. Contact</h2>
            <p>For questions about this Privacy Policy, contact us at <a href="mailto:hello@calvote.ai" className="text-[#1A5C52] underline">hello@calvote.ai</a>.</p>
          </section>

        </div>
      </main>

      <footer className="px-8 py-6 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#9CA3AF] mt-8">
        <span>© {new Date().getFullYear()} calvote. All rights reserved.</span>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-[#1C2B3A] transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-[#1C2B3A] transition-colors">Terms of Use</Link>
        </div>
      </footer>
    </div>
  )
}
