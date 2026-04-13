'use client'

import { useState, useEffect } from 'react'
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
  Link2,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

type Contact = {
  id: string
  name: string
  email: string
  phone: string
  calendarLinked: boolean
  calendarEmail?: string
}

export default function ContactsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' })

  // Load contacts from Firestore
  useEffect(() => {
    if (!user) return
    const ref = collection(db, 'users', user.uid, 'contacts')
    const unsub = onSnapshot(ref, snap => {
      setContacts(
        snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Contact, 'id'>) }))
      )
      setLoading(false)
    })
    return unsub
  }, [user])

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const addContact = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !form.name || !form.email) return
    setSaving(true)
    try {
      await addDoc(collection(db, 'users', user.uid, 'contacts'), {
        name: form.name,
        email: form.email,
        phone: form.phone,
        calendarLinked: false,
        createdAt: serverTimestamp(),
      })
      setForm({ name: '', email: '', phone: '' })
      setShowForm(false)
      toast.success('Contact added.')
    } catch {
      toast.error('Failed to save contact.')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    if (!user) return
    await deleteDoc(doc(db, 'users', user.uid, 'contacts', id))
    toast.success('Contact removed.')
  }

  const startEdit = (contact: Contact) => {
    setEditingId(contact.id)
    setEditForm({ name: contact.name, email: contact.email, phone: contact.phone || '' })
  }

  const saveEdit = async (id: string) => {
    if (!user || !editForm.name || !editForm.email) return
    try {
      await updateDoc(doc(db, 'users', user.uid, 'contacts', id), {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
      })
      setEditingId(null)
      toast.success('Contact updated.')
    } catch {
      toast.error('Failed to update contact.')
    }
  }

  const copyInviteLink = async (contact: Contact) => {
    if (!user) return
    try {
      const res = await fetch('/api/contacts/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerUid: user.uid, contactId: contact.id, contactEmail: contact.email }),
      })
      const { link } = await res.json()
      await navigator.clipboard.writeText(link)
      setCopiedId(contact.id)
      toast.success('Invite link copied! Send it to ' + contact.name)
      setTimeout(() => setCopiedId(null), 3000)
    } catch {
      toast.error('Failed to generate invite link.')
    }
  }

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
                disabled={saving}
                className="bg-[#1A5C52] text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#1A5C52]/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                Save Contact
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-[#1A5C52]" size={28} />
        </div>
      )}

      {/* Contacts Grid */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(contact => (
            <div key={contact.id} className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm hover:shadow-md transition-shadow">
              {editingId === contact.id ? (
                /* Inline edit form */
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Full name *"
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C52]/20 focus:border-[#1A5C52]"
                  />
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="Email *"
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C52]/20 focus:border-[#1A5C52]"
                  />
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="Phone"
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5C52]/20 focus:border-[#1A5C52]"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(contact.id)}
                      className="flex-1 bg-[#1A5C52] text-white text-xs font-semibold py-2 rounded-lg hover:bg-[#1A5C52]/90 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 bg-[#F3F4F6] text-[#6B7280] text-xs font-semibold py-2 rounded-lg hover:bg-[#E5E7EB] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1A5C52]/10 text-[#1A5C52] flex items-center justify-center font-bold text-sm shrink-0">
                        {contact.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-bold text-[#1C2B3A] text-sm">{contact.name}</p>
                        {contact.calendarLinked ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-[#1A5C52]/10 text-[#1A5C52] flex items-center gap-1 w-fit">
                            <CheckCircle2 size={9} /> Calendar Linked
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-[#F3F4F6] text-[#6B7280]">
                            No Calendar
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => startEdit(contact)}
                        className="p-1.5 hover:bg-[#F9FAFB] rounded-lg transition-colors text-[#6B7280] hover:text-[#1A5C52]"
                      >
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
                    {contact.calendarLinked && contact.calendarEmail && (
                      <p className="flex items-center gap-2 text-xs text-[#1A5C52]">
                        <Calendar size={12} className="shrink-0" />{contact.calendarEmail}
                      </p>
                    )}
                  </div>

                  {!contact.calendarLinked && (
                    <button
                      onClick={() => copyInviteLink(contact)}
                      className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-[#E5E7EB] text-xs text-[#6B7280] hover:border-[#1A5C52] hover:text-[#1A5C52] transition-colors"
                    >
                      {copiedId === contact.id ? (
                        <><CheckCircle2 size={12} className="text-[#1A5C52]" /> Link copied!</>
                      ) : (
                        <><Link2 size={12} /> Copy calendar invite link</>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
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
