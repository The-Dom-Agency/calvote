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

export default function PreviewMeetingPage() {
  const router = useRouter()
  const [isSending, setIsSending] = useState(false)
  const [draft, setDraft] = useState<MeetingDraft | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('meetingDraft')
    if (raw) {
      setDraft(JSON.parse(raw))
    }
  }, [])

  const handleConfirm = () => {
    setIsSending(true)
    setTimeout(() => {
      toast.success('Meeting requests sent successfully!')
      sessionStorage.removeItem('meetingDraft')
      router.push('/confirmed')
    }, 2500)
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
