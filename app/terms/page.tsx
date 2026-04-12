import Link from 'next/link'
import { Logo } from '@/components/Logo'

export const metadata = {
  title: 'Terms of Use — calvote',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-8 py-5 border-b border-[#E5E7EB]">
        <Link href="/"><Logo /></Link>
        <Link href="/login" className="px-5 py-2.5 rounded-lg text-sm font-semibold text-[#1C2B3A] border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors">
          Log in
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-[#1C2B3A] mb-2">Terms of Use</h1>
        <p className="text-sm text-[#9CA3AF] mb-12">Last updated: April 13, 2026</p>

        <div className="prose prose-slate max-w-none space-y-10 text-[#374151] leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using calvote (&quot;the Service&quot;) at calvote.ai, you agree to be bound by these Terms of Use. If you do not agree, do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">2. Description of Service</h2>
            <p>calvote is a smart scheduling platform that allows users to connect their Google Calendar, manage meeting availability, and send scheduling invitations. Access to the Service requires activation via a valid promo code or approved subscription plan.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">3. Account Registration</h2>
            <p className="mb-3">You must sign in using a valid Google account to use calvote. You are responsible for maintaining the security of your account and all activity that occurs under it.</p>
            <p>You agree to provide accurate information and keep it up to date. We reserve the right to suspend or terminate accounts that violate these Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">4. Acceptable Use</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Interfere with or disrupt the Service or its infrastructure</li>
              <li>Send unsolicited communications using the SMS feature</li>
              <li>Share, resell, or transfer your account to any third party</li>
              <li>Use the Service to store or transmit malicious code</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">5. Google Calendar Integration</h2>
            <p>By connecting your Google Calendar, you authorize calvote to read your calendar availability and create events on your behalf. You may revoke this access at any time from your Google Account settings or from within calvote. You remain responsible for any calendar events created through the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">6. SMS Communications</h2>
            <p>By providing a phone number, you consent to receive SMS messages related to your scheduled meetings. Standard message and data rates may apply. You may opt out at any time by contacting us or replying STOP to any message.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">7. Promo Codes and Plans</h2>
            <p>Access to the full Service requires a valid promo code or active plan. Promo codes are single-use and non-transferable. Plans are subject to meeting volume limits as described at the time of activation. We reserve the right to modify plan limits and pricing with reasonable notice.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">8. Intellectual Property</h2>
            <p>All content, branding, and software within calvote are the property of calvote and protected by applicable intellectual property laws. You may not copy, reproduce, or distribute any part of the Service without written permission.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">9. Disclaimer of Warranties</h2>
            <p>The Service is provided &quot;as is&quot; without warranties of any kind. We do not guarantee that the Service will be uninterrupted, error-free, or meet your specific requirements.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">10. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, calvote shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including loss of data, revenue, or business opportunities.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">11. Termination</h2>
            <p>We reserve the right to suspend or terminate your access to the Service at any time for violation of these Terms or for any other reason at our discretion. You may also terminate your account by contacting us.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">12. Changes to Terms</h2>
            <p>We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the updated Terms. We will notify users of material changes via email or a notice on the platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">13. Governing Law</h2>
            <p>These Terms are governed by applicable law. Any disputes shall be resolved through binding arbitration or the courts of the applicable jurisdiction.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">14. Contact</h2>
            <p>For questions about these Terms, contact us at <a href="mailto:hello@calvote.ai" className="text-[#1A5C52] underline">hello@calvote.ai</a>.</p>
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
