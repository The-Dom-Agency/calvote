'use client'

import { useRouter } from 'next/navigation'
import {
  CheckCircle2,
  Calendar,
  Clock,
  Users,
  Plus,
  Share2,
  Smartphone,
  MessageCircle,
  Home,
} from 'lucide-react'

const finalMeeting = {
  title: 'Project Kickoff Sync',
  date: 'Wednesday, April 15, 2026',
  time: '2:00 PM – 3:00 PM',
  responded: [
    { initials: 'TB', name: 'Travis Barker' },
    { initials: 'SG', name: 'Selena Gomez' },
    { initials: 'JB', name: 'Justin Bieber' },
  ],
  pending: [{ name: 'Dua Lipa' }],
}

export default function MeetingConfirmedPage() {
  const router = useRouter()

  return (
    <div className="max-w-3xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden text-center p-12">
        <div className="w-24 h-24 bg-[#C49A2A]/10 text-[#C49A2A] rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
          <CheckCircle2 size={48} />
        </div>

        <h1 className="text-3xl font-bold text-[#1C2B3A] mb-2">Meeting Confirmed!</h1>
        <p className="text-[#6B7280] mb-8">The best slot has been selected and the team has been notified.</p>

        <div className="bg-[#1A5C52]/5 border border-[#1A5C52]/10 rounded-2xl p-8 mb-10 max-w-lg mx-auto">
          <h2 className="text-xl font-bold text-[#1C2B3A] mb-6">{finalMeeting.title}</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 text-lg font-bold text-[#1A5C52]">
              <Calendar size={20} />
              {finalMeeting.date}
            </div>
            <div className="flex items-center justify-center gap-3 text-lg font-bold text-[#1A5C52]">
              <Clock size={20} />
              {finalMeeting.time}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#1A5C52]/10">
            <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-4 flex items-center justify-center gap-2">
              <Users size={14} /> Attendees
            </p>
            <div className="flex items-center justify-center flex-wrap gap-4">
              {finalMeeting.responded.map((person, i) => (
                <div key={i} className="flex flex-col items-center gap-1 group">
                  <div className="w-10 h-10 rounded-full bg-[#1A5C52] text-white flex items-center justify-center font-bold text-xs border-2 border-white shadow-sm transition-transform group-hover:scale-110">
                    {person.initials}
                  </div>
                  <span className="text-[10px] font-medium text-[#1C2B3A]">{person.name}</span>
                </div>
              ))}
              {finalMeeting.pending.map((person, i) => (
                <div key={i} className="flex flex-col items-center gap-1 opacity-50 grayscale">
                  <div className="w-10 h-10 rounded-full bg-[#F3F4F6] text-[#6B7280] flex items-center justify-center font-bold text-xs border-2 border-white shadow-sm">
                    {person.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="text-[10px] font-medium text-[#6B7280]">{person.name}</span>
                </div>
              ))}
            </div>
            {finalMeeting.pending.length > 0 && (
              <p className="text-[10px] text-[#6B7280] mt-4 italic font-medium">
                *{finalMeeting.pending[0].name} could not make it but has been informed of the selected time.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-12">
          <button className="flex-1 bg-[#1A5C52] text-white font-bold py-4 rounded-xl hover:bg-[#1A5C52]/90 transition-all shadow-lg shadow-[#1A5C52]/20 flex items-center justify-center gap-2">
            <Plus size={18} /> Add to Calendar
          </button>
          <button className="flex-1 bg-white border-2 border-[#1A5C52] text-[#1A5C52] font-bold py-4 rounded-xl hover:bg-[#1A5C52]/5 transition-all flex items-center justify-center gap-2">
            <Share2 size={18} /> Share Details
          </button>
        </div>

        {/* Mock SMS preview */}
        <div className="pt-10 border-t border-[#E5E7EB]">
          <h3 className="text-xs font-bold text-[#1A5C52] uppercase tracking-wider mb-6 flex items-center justify-center gap-2">
            <Smartphone size={16} /> Confirmation Message Sent
          </h3>
          <div className="max-w-[300px] mx-auto relative p-6 bg-[#F3F4F6] rounded-[40px] border-[6px] border-[#E5E7EB] shadow-xl">
            <div className="w-1/3 h-1 bg-[#E5E7EB] rounded-full mx-auto mb-4" />
            <div className="bg-[#1A5C52] text-white p-3 rounded-2xl rounded-tr-none text-[10px] text-left leading-relaxed shadow-sm">
              <p className="font-bold mb-1 flex items-center gap-1">
                <MessageCircle size={10} /> calvote
              </p>
              Meeting Finalized! <strong>{finalMeeting.title}</strong> is set for {finalMeeting.date} at {finalMeeting.time.split(' – ')[0]}.
              <br /><br />
              We&apos;ve added this to your calendar. See you there!
            </div>
            <div className="w-1/2 h-1 bg-[#E5E7EB] rounded-full mx-auto mt-6" />
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-[#1A5C52] font-bold text-sm hover:underline flex items-center justify-center gap-2 mx-auto"
        >
          <Home size={16} /> Back to Dashboard
        </button>
      </div>
    </div>
  )
}
