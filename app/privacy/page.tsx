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
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#1C2B3A] font-medium mb-10 transition-colors group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Home
        </Link>
        <h1 className="text-4xl font-bold text-[#1C2B3A] mb-2">Privacy Policy</h1>
        <p className="text-sm text-[#9CA3AF] mb-12">Last updated: April 13, 2026</p>

        <div className="prose prose-slate max-w-none space-y-10 text-[#374151] leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">What calvote Does</h2>
            <p>calvote is a team scheduling platform that connects your Google Calendar, manages your contacts, and coordinates meeting availability across your team. It sends meeting invitations and calendar connection requests via your connected Gmail account.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">Information We Collect</h2>

            <p className="font-semibold text-[#1C2B3A] mt-4 mb-1">Account Information</p>
            <p>When you sign in with Google, we collect your name, email address, and profile picture to create and identify your calvote account.</p>

            <p className="font-semibold text-[#1C2B3A] mt-4 mb-1">Contacts</p>
            <p>You may add contacts (name, email, phone number) to your account. This information is stored in our database and is used solely to enable scheduling and calendar connection features within your account.</p>

            <p className="font-semibold text-[#1C2B3A] mt-4 mb-1">Meeting Data</p>
            <p>When you schedule a meeting, we store the meeting title, description, selected dates, time window, attendee list, and scheduling preferences. This data is used to manage your meeting requests and availability coordination.</p>

            <p className="font-semibold text-[#1C2B3A] mt-4 mb-1">Google Calendar &amp; Gmail Access</p>
            <p className="mb-2">If you choose to connect your Google account, calvote requests the following permissions:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>calendar.readonly</strong> — to read your calendar availability and exclude busy times when presenting options to invitees.</li>
              <li><strong>calendar.events.readonly</strong> — to read existing events for availability checking.</li>
              <li><strong>gmail.send</strong> — to send meeting invitations and calendar connection requests from your Gmail account to your contacts.</li>
              <li><strong>openid, email, profile</strong> — to identify your Google account and display your email address.</li>
            </ul>
            <p className="mt-3">We do not read your emails, modify your calendar, delete events, or access any data beyond what is listed above. OAuth tokens are stored securely in our database and are deleted when you disconnect your Google account.</p>

            <p className="font-semibold text-[#1C2B3A] mt-4 mb-1">Invite Tokens</p>
            <p>When you invite a contact to connect their calendar, we generate a unique, single-use token stored in our database. This token is used only to link that contact&apos;s calendar to your account upon their consent.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To authenticate you and maintain your account</li>
              <li>To display and manage your contacts and meetings</li>
              <li>To send meeting invitation emails to your attendees via your Gmail account</li>
              <li>To send calendar connection invitations to your contacts via your Gmail account</li>
              <li>To check calendar availability when scheduling meetings</li>
            </ul>
            <p className="mt-3">We do not use your data for advertising, analytics profiling, or any purpose beyond operating the platform features described above.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">Google API Usage</h2>
            <p>calvote&apos;s use of information received from Google APIs adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy" className="text-[#1A5C52] underline" target="_blank" rel="noopener noreferrer">Google API Services User Data Policy</a>, including the Limited Use requirements. Google user data is never used for advertising, resold, or shared with third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">Data Storage</h2>
            <p>Your data — account info, contacts, meetings, and OAuth tokens — is stored in Google Firebase Firestore, a secure cloud database. Data is associated with your individual account and protected by Firebase security rules.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">Google User Data — Retention and Deletion</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>OAuth tokens are stored only as long as your Google Calendar remains connected to calvote.</li>
              <li>You can disconnect your Google account at any time from the dashboard, which removes your stored tokens.</li>
              <li>You can also revoke access directly at <a href="https://myaccount.google.com/permissions" className="text-[#1A5C52] underline" target="_blank" rel="noopener noreferrer">Google Account Permissions</a>.</li>
              <li>If you delete your calvote account, all associated data — including contacts, meetings, and OAuth tokens — is permanently deleted.</li>
              <li>Google user data is never used for advertising, resold, or shared with third parties.</li>
            </ul>
            <p className="mt-3">To request deletion of your data, contact us at <a href="mailto:design@thedomagency.com" className="text-[#1A5C52] underline">design@thedomagency.com</a>. We will respond within 30 days.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">Third-Party Services</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Firebase (Google):</strong> Authentication and database storage</li>
              <li><strong>Google Calendar &amp; Gmail API:</strong> Calendar access and email sending</li>
              <li><strong>Twilio:</strong> SMS notifications and reminders</li>
              <li><strong>Vercel:</strong> Application hosting and infrastructure</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">Data Sharing</h2>
            <p>We do not sell, share, or transfer your data to third parties. The only external communications are between our servers and Google&apos;s Calendar and Gmail APIs to perform features you have authorized, and between your browser and Firebase for real-time data sync.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">Data Security</h2>
            <p>We use industry-standard security measures including HTTPS, Firebase security rules, and Google&apos;s OAuth 2.0 protocol. OAuth tokens are stored server-side and never exposed to the browser. We never store Google account passwords.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">Children&apos;s Privacy</h2>
            <p>calvote is not intended for individuals under the age of 13. We do not knowingly collect information from children under 13.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Changes will be reflected on this page with an updated date. Continued use of the platform after changes constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1C2B3A] mb-3">Contact</h2>
            <p>If you have questions about this Privacy Policy, contact us at <a href="mailto:design@thedomagency.com" className="text-[#1A5C52] underline">design@thedomagency.com</a>.</p>
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
