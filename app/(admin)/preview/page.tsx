'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Send,
  CheckCircle2,
  Smartphone,
  Info,
  Mail,
} from 'lucide-react'
import { toast } from 'sonner'
import { collection, addDoc, setDoc, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'

type MeetingDraft = {
  title: string
  description: string
  timeFrom: string
  timeTo: string
  schedulingRule: string
  sendVia: string
  attendees: { id: string; name: string; email: string; calendarLinked: boolean }[]
  dates: string[]
  primaryPersonId: string
  primaryPersonName: string
}

function fmt12(t: string) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}

function buildMeetingInviteEmail({ draft, attendeeName, availabilityLink }: { draft: MeetingDraft; attendeeName: string; availabilityLink: string }) {
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#fff;border:1px solid #E5E7EB;border-radius:12px;overflow:hidden;">
      <div style="background:#1A5C52;padding:24px 32px;">
        <p style="color:#fff;font-weight:800;font-size:18px;margin:0;">calvote</p>
        <p style="color:rgba(255,255,255,0.7);font-size:13px;margin:4px 0 0;">Meeting Invitation</p>
      </div>
      <div style="padding:32px;">
        <p style="color:#1C2B3A;font-size:15px;margin:0 0 8px;">Hi ${attendeeName},</p>
        <p style="color:#6B7280;font-size:14px;margin:0 0 24px;">
          You've been invited to <strong style="color:#1C2B3A;">${draft.title}</strong>.
          ${draft.description ? `<br/><br/>${draft.description}` : ''}
        </p>
        <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:16px;margin-bottom:24px;">
          <p style="color:#6B7280;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 12px;">Meeting Details</p>
          <p style="color:#1C2B3A;font-size:13px;margin:0 0 6px;">📅 ${draft.dates.length} date${draft.dates.length > 1 ? 's' : ''} in window</p>
          <p style="color:#1C2B3A;font-size:13px;margin:0;">🕐 ${fmt12(draft.timeFrom)} – ${fmt12(draft.timeTo)}</p>
        </div>
        <p style="color:#6B7280;font-size:13px;margin:0 0 20px;">Please share your availability so we can find the best time for everyone.</p>
        <a href="${availabilityLink}" style="display:inline-block;background:#1A5C52;color:#fff;font-weight:700;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none;">
          Provide Availability
        </a>
      </div>
      <div style="padding:16px 32px;border-top:1px solid #E5E7EB;background:#F9FAFB;">
        <p style="color:#9CA3AF;font-size:11px;margin:0;">This email was sent via calvote. You only need to share your availability — we never access your calendar without permission.</p>
      </div>
    </div>
  `
}

export default function PreviewMeetingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSending, setIsSending] = useState(false)
  const [draft, setDraft] = useState<MeetingDraft | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('meetingDraft')
    if (raw) setDraft(JSON.parse(raw))
  }, [])

  const handleConfirm = async () => {
    if (!draft || !user) return
    setIsSending(true)
    try {
      const meetingData = {
        title: draft.title,
        description: draft.description,
        timeFrom: draft.timeFrom,
        timeTo: draft.timeTo,
        schedulingRule: draft.schedulingRule,
        sendVia: draft.sendVia,
        attendees: draft.attendees,
        dates: draft.dates,
        primaryPersonId: draft.primaryPersonId,
        primaryPersonName: draft.primaryPersonName,
        ownerUid: user.uid,
        status: 'pending',
        createdAt: serverTimestamp(),
      }

      // Save to user's meetings and capture the ID
      const meetingRef = await addDoc(collection(db, 'users', user.uid, 'meetings'), meetingData)
      const meetingId = meetingRef.id

      // Save to publicMeetings so the availability page can read it without auth
      await setDoc(doc(db, 'publicMeetings', meetingId), meetingData)

      // Count this as 1 meeting used (counts on send, not on confirmation)
      await updateDoc(doc(db, 'users', user.uid), {
        meetingsUsed: increment(1),
      })

      // Send email to each attendee with the real meeting link
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://calvote.ai'
      // Each attendee gets a personalised link with their name pre-filled
      const makeAvailabilityLink = (name: string) =>
        `${appUrl}/availability/${meetingId}?name=${encodeURIComponent(name)}`
      const attendeesWithEmail = draft.attendees.filter(a => a.email)
      if (attendeesWithEmail.length > 0) {
        const results = await Promise.allSettled(
          attendeesWithEmail.map(async attendee => {
            const res = await fetch('/api/email/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                uid: user.uid,
                to: attendee.email,
                subject: `Meeting Invitation: ${draft.title}`,
                html: buildMeetingInviteEmail({ draft, attendeeName: attendee.name, availabilityLink: makeAvailabilityLink(attendee.name) }),
              }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Send failed')
            return data
          })
        )
        const failed = results.filter(r => r.status === 'rejected')
        if (failed.length > 0) {
          const reason = (failed[0] as PromiseRejectedResult).reason?.message
          toast.error(`Email failed: ${reason}`, { id: 'email-error' })
        }
      }

      toast.success('Meeting requests sent successfully!', { id: 'meeting-sent' })
      sessionStorage.removeItem('meetingDraft')
      router.push('/confirmed')
    } catch {
      toast.error('Failed to send meeting request.')
      setIsSending(false)
    }
  }

  if (!draft) {
    return (
      <div className="max-w-4xl mx-auto pb-12 flex flex-col items-center justify-center py-24 gap-4">
        <Calendar className="text-[#E5E7EB]" size={48} />
        <p className="text-[#6B7280] text-sm">No meeting draft found.</p>
        <button
          onClick={() => router.push('/schedule')}
          className="text-[#1A5C52] font-semibold text-sm hover:underline"
        >
          ← Back to Schedule
        </button>
      </div>
    )
  }

  const primaryIsSynced = draft.primaryPersonId !== 'me'
    ? draft.attendees.find(a => a.id === draft.primaryPersonId)?.calendarLinked
    : true // user's own calendar is always synced if connected

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <button
        onClick={() => router.push('/schedule')}
        disabled={isSending}
        className="flex items-center gap-2 text-[#6B7280] hover:text-[#1C2B3A] font-medium transition-colors mb-6 group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Edit
      </button>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-[#1A5C52] px-6 sm:px-8 py-6 text-white flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Preview Meeting Request</h1>
            <p className="text-white/80 text-sm mt-1">Review the details before notifying your team.</p>
          </div>
          <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 flex items-center gap-2 shrink-0">
            <Mail size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">{draft.sendVia} Ready</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-[#E5E7EB]">
          {/* Left: Summary */}
          <div className="md:col-span-3 p-6 sm:p-8 space-y-6">
            <section className="space-y-2">
              <h2 className="text-xl font-bold text-[#1C2B3A]">{draft.title}</h2>
              {draft.description && (
                <p className="text-[#6B7280] text-sm leading-relaxed">{draft.description}</p>
              )}
            </section>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <section className="space-y-3">
                <h3 className="text-xs font-bold text-[#1A5C52] uppercase tracking-wider flex items-center gap-2">
                  <Users size={14} /> Attendees
                </h3>
                {draft.attendees.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {draft.attendees.map(a => (
                      <div key={a.id} className="bg-[#1A5C52]/5 text-[#1A5C52] px-3 py-1.5 rounded-full text-xs font-semibold border border-[#1A5C52]/10">
                        {a.name}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#9CA3AF]">No attendees added.</p>
                )}
              </section>

              <section className="space-y-3">
                <h3 className="text-xs font-bold text-[#1A5C52] uppercase tracking-wider flex items-center gap-2">
                  <Calendar size={14} /> Available Window
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-[#1C2B3A] font-medium">
                    <Calendar size={15} className="text-[#6B7280]" />
                    {draft.dates.length > 0 ? `${draft.dates.length} date${draft.dates.length > 1 ? 's' : ''} selected` : 'No dates selected'}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#1C2B3A] font-medium">
                    <Clock size={15} className="text-[#6B7280]" />
                    {fmt12(draft.timeFrom)} – {fmt12(draft.timeTo)}
                  </div>
                </div>
              </section>
            </div>

            {/* Primary person info */}
            {primaryIsSynced && (
              <section className="bg-[#F0FDF9] p-4 rounded-xl border border-[#1A5C52]/20 flex items-start gap-3">
                <Info size={17} className="text-[#1A5C52] mt-0.5 shrink-0" />
                <div className="text-xs text-[#6B7280] leading-relaxed">
                  <p className="font-bold text-[#1C2B3A] mb-1">
                    {draft.primaryPersonName}&apos;s availability is synced
                  </p>
                  Busy slots from {draft.primaryPersonName}&apos;s calendar will be automatically excluded from the options presented to invitees.
                </div>
              </section>
            )}
          </div>

          {/* Right: Email Preview */}
          <div className="md:col-span-2 p-6 sm:p-8 bg-[#F9FAFB]">
            <h3 className="text-xs font-bold text-[#1A5C52] uppercase tracking-wider flex items-center gap-2 mb-5">
              <Mail size={14} /> Email Preview
            </h3>

            <div className="bg-white border border-[#E5E7EB] p-5 rounded-xl shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#1A5C52]" />
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-[#1A5C52]/10 flex items-center justify-center text-[10px] font-bold text-[#1A5C52]">CV</div>
                <span className="text-[10px] font-bold text-[#1C2B3A]">calvote Notification</span>
              </div>
              <p className="font-bold text-xs text-[#1C2B3A] mb-3">Subject: Meeting Invitation: {draft.title}</p>
              <div className="text-[11px] text-[#6B7280] space-y-2">
                <p>Hi team,</p>
                <p>You&apos;ve been invited to <strong>{draft.title}</strong>. Please share your availability.</p>
                {draft.dates.length > 0 && (
                  <p>Window: <strong>{draft.dates.length} date{draft.dates.length > 1 ? 's' : ''}</strong>, {fmt12(draft.timeFrom)} – {fmt12(draft.timeTo)}</p>
                )}
                <button
                  onClick={() => router.push('/availability/demo-meeting')}
                  className="inline-block bg-[#1A5C52] text-white px-4 py-2 rounded font-bold text-[10px] mt-2 cursor-pointer hover:bg-[#1A5C52]/90 transition-colors"
                >
                  Provide Availability
                </button>
              </div>
            </div>

            <button
              onClick={() => router.push('/availability/demo-meeting')}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-[#1A5C52] text-[#1A5C52] font-bold text-xs hover:bg-[#1A5C52]/5 transition-all"
            >
              <Smartphone size={16} />
              Preview Invitee Experience
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 sm:p-8 border-t border-[#E5E7EB] bg-white flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.push('/schedule')}
            disabled={isSending}
            className="flex-1 bg-white border-2 border-[#E5E7EB] text-[#1C2B3A] font-bold py-4 rounded-xl hover:bg-[#F9FAFB] transition-all"
          >
            Edit Details
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSending}
            className="flex-[2] bg-[#1A5C52] text-white font-bold py-4 rounded-xl hover:bg-[#1A5C52]/90 transition-all shadow-lg shadow-[#1A5C52]/20 flex items-center justify-center gap-2 relative overflow-hidden"
          >
            {!isSending && <><Send size={18} /> Confirm and Send</>}
            <AnimatePresence>
              {isSending && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-[#1A5C52] flex items-center justify-center"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1.5], opacity: [0.5, 0.2, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-20 h-20 bg-white/30 rounded-full absolute"
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    <CheckCircle2 size={24} className="animate-pulse" />
                    NOTIFYING TEAM
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </div>
  )
}
