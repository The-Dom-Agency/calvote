'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Plus,
  Search,
  Edit2,
  Trash2,
  Calendar,
  Phone,
  Mail,
  X,
} from 'lucide-react'

type Contact = {
  id: number
  name: string
  email: string
  phone: string
  calendarLinked: boolean
}

const initialContacts: Contact[] = []

export default function ContactsPage() {
  const router = useRouter()
  const [contacts, setContacts] = useState<Contact[]>(initialContacts)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const addContact = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email) return
    setContacts(prev => [
      ...prev,
      { id: Date.now(), ...form, calendarLinked: false },
    ])
    setForm({ name: '', email: '', phone: '' })
    setShowForm(false)
  }

  const remove = (id: number) => setContacts(prev => prev.filter(c => c.id !== id))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 hover:bg-[#F9FAFB] rounded-lg transition-colors text-[#6B7280]"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[#1C2B3A]">Contacts</h1>
            <p className="text-[#6B7280] mt-1">{contacts.length} people in your directory</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 bg-[#1A5C52] text-white px-5 py-3 rounded-lg font-semibold hover:bg-[#1A5C52]/90 transition-all shadow-sm"
        >
          <Plus size={18} />
          Add Contact
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" size={18} />
        <input
          type="text"
          placeholder="Search contacts..."
          className="w-full pl-10 pr-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C52]/20 focus:border-[#1A5C52] transition-all"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Add Contact Form */}
      {showForm && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#1C2B3A]">New Contact</h2>
            <button onClick={() => setShowForm(false)} className="text-[#6B7280] hover:text-[#1C2B3A]">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={addContact} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Full name *"
              required
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="px-4 py-2.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C52]/20 focus:border-[#1A5C52]"
            />
            <input
              type="email"
              placeholder="Email *"
              required
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="px-4 py-2.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C52]/20 focus:border-[#1A5C52]"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              className="px-4 py-2.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C52]/20 focus:border-[#1A5C52]"
            />
            <div className="sm:col-span-3 flex justify-end">
              <button
                type="submit"
                className="bg-[#1A5C52] text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#1A5C52]/90 transition-colors"
              >
                Save Contact
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(contact => (
          <div key={contact.id} className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1A5C52]/10 text-[#1A5C52] flex items-center justify-center font-bold text-sm">
                  {contact.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-bold text-[#1C2B3A] text-sm">{contact.name}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    contact.calendarLinked
                      ? 'bg-[#C49A2A]/10 text-[#C49A2A]'
                      : 'bg-[#F3F4F6] text-[#6B7280]'
                  }`}>
                    {contact.calendarLinked ? 'Calendar Linked' : 'Not Linked'}
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                <button className="p-1.5 hover:bg-[#F9FAFB] rounded-lg transition-colors text-[#6B7280] hover:text-[#1A5C52]">
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => remove(contact.id)}
                  className="p-1.5 hover:bg-[#F9FAFB] rounded-lg transition-colors text-[#6B7280] hover:text-[#EF4444]"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-xs text-[#6B7280]">
                <Mail size={12} className="shrink-0" />{contact.email}
              </p>
              {contact.phone && (
                <p className="flex items-center gap-2 text-xs text-[#6B7280]">
                  <Phone size={12} className="shrink-0" />{contact.phone}
                </p>
              )}
            </div>
            {!contact.calendarLinked && (
              <button className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-[#E5E7EB] text-xs text-[#6B7280] hover:border-[#1A5C52] hover:text-[#1A5C52] transition-colors">
                <Calendar size={12} />
                Link Calendar
              </button>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 flex flex-col items-center gap-2">
          <Mail className="text-[#E5E7EB]" size={40} />
          <p className="text-[#6B7280] text-sm font-medium">
            {searchTerm ? 'No contacts match your search.' : 'No contacts yet. Add your first contact above.'}
          </p>
        </div>
      )}
    </div>
  )
}
