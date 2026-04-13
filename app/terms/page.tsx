import Link from 'next/link'
import { Logo } from '@/components/Logo'

export const metadata = {
  title: 'Terms of Service — calvote',
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
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#1C2B3A] font-medium mb-10 transition-colors group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Home
        </Link>
        <h1 className="text-4xl font-bold text-[#1C2B3A] mb-2">Terms of Service</h1>
        <p className="text-sm text-[#9CA3AF] mb-12">Last updated: April 13, 2026</p>

        <div className="prose prose-slate max-w-none space-y-10 text-[#374151] leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">What calvote Provides</h2>
            <p>calvote is a team scheduling platform that allows you to connect your Google Calendar, manage contacts, coordinate meeting availability, and send scheduling communications via your connected Gmail account. The Platform is provided on a subscription basis with a free tier available. By creating an account or using calvote, you agree to these Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">Your Account</h2>
            <p>You are responsible for maintaining the security of your account credentials. You agree to notify us immediately at <a href="mailto:design@thedomagency.com" className="text-[#1A5C52] underline">design@thedomagency.com</a> if you suspect unauthorized access to your account. We are not liable for losses resulting from unauthorized access due to your failure to secure your credentials.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">Your Responsibilities</h2>
            <p className="mb-3">By using calvote, you agree that:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>You are responsible for the accuracy of all contact information, meeting details, and communications sent through the Platform.</li>
              <li>You will only send meeting invitations and calendar connection requests to individuals who have a legitimate reason to receive them.</li>
              <li>You will not use calvote to send spam or unsolicited bulk communications.</li>
              <li>You will not use calvote to harass, deceive, or impersonate any individual or organization.</li>
              <li>You are solely responsible for compliance with any applicable laws regarding scheduling communications and data privacy in your jurisdiction.</li>
              <li>You are responsible for ensuring contacts have appropriate consent before connecting their calendars through the Platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">Google Account Usage</h2>
            <p className="mb-3">If you connect your Google account, you authorize calvote to:</p>
            <ul className="list-disc pl-5 space-y-2 mb-3">
              <li>Read your Google Calendar availability to assist with scheduling.</li>
              <li>Send emails from your Gmail account to your contacts for meeting invitations and calendar connection requests.</li>
            </ul>
            <p className="mb-2">You acknowledge that:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Emails are sent from your Google account, not from calvote&apos;s.</li>
              <li>You are responsible for the content of all communications sent through the Platform.</li>
              <li>You can revoke access at any time from your dashboard or via <a href="https://myaccount.google.com/permissions" className="text-[#1A5C52] underline" target="_blank" rel="noopener noreferrer">Google Account Permissions</a>.</li>
              <li>calvote&apos;s use of Google user data complies with the <a href="https://developers.google.com/terms/api-services-user-data-policy" className="text-[#1A5C52] underline" target="_blank" rel="noopener noreferrer">Google API Services User Data Policy</a>, including the Limited Use requirements.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">SMS Communications</h2>
            <p>By providing a phone number, you and your contacts consent to receive SMS messages related to scheduled meetings. Standard message and data rates may apply. You may opt out at any time by contacting us or replying STOP to any message.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">Acceptable Use</h2>
            <p className="mb-3">You may not use calvote to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Send fraudulent, misleading, or deceptive communications.</li>
              <li>Impersonate another individual or organization.</li>
              <li>Violate any applicable local, national, or international laws.</li>
              <li>Attempt to gain unauthorized access to the Platform, other users&apos; accounts, or connected services.</li>
              <li>Reverse engineer, copy, or redistribute any part of the Platform.</li>
            </ul>
            <p className="mt-3">We reserve the right to suspend or terminate accounts that violate these Terms without notice.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">Plans and Billing</h2>
            <p>Access to full platform features is subject to the plan in effect at the time of subscription. Plans are subject to meeting volume limits as described at activation. We reserve the right to modify plan limits and pricing with reasonable notice. Promo codes are single-use and non-transferable.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">Intellectual Property</h2>
            <p>All content, branding, and software within calvote are the property of calvote and protected by applicable intellectual property laws. You may not copy, reproduce, or distribute any part of the Platform without written permission.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">No Warranty</h2>
            <p>calvote is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, express or implied. We do not guarantee uninterrupted service, error-free operation, or that emails sent via the Platform will be delivered successfully. You should verify all meeting details and communications before sending.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, calvote shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform, including but not limited to failed email delivery, scheduling errors, data loss, or loss of business opportunities.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">Termination</h2>
            <p>We reserve the right to suspend or terminate your access to the Platform at any time for violation of these Terms or for any other reason at our discretion. You may also terminate your account by contacting us. Upon termination, all your data will be permanently deleted.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">Changes to Terms</h2>
            <p>We may update these Terms from time to time. We will make reasonable efforts to notify users of material changes. Continued use of the Platform after changes constitutes acceptance of the updated Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">Governing Law</h2>
            <p>These Terms are governed by applicable law without regard to conflict of law principles. Any disputes shall be resolved through binding arbitration or the courts of the applicable jurisdiction.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">Contact</h2>
            <p>If you have questions about these Terms, contact us at <a href="mailto:design@thedomagency.com" className="text-[#1A5C52] underline">design@thedomagency.com</a>.</p>
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
