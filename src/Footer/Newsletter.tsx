'use client'

import React, { useState } from 'react'

const FORM_ID = 3 // formulaire « Newsletter » (form-builder)

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || status === 'loading') return
    setStatus('loading')
    try {
      const res = await fetch('/api/form-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form: FORM_ID,
          submissionData: [{ field: 'email', value: email }],
        }),
      })
      setStatus(res.ok ? 'done' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <p className="max-w-[300px] font-serif text-[15px] leading-relaxed text-white/80">
        Merci — votre inscription est bien prise en compte.
      </p>
    )
  }

  return (
    <form onSubmit={submit} className="flex max-w-[330px]">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Votre adresse e-mail"
        className="min-w-0 flex-1 rounded-l-[4px] border border-r-0 border-white/30 bg-white/10 px-3.5 py-3 font-serif text-sm text-white outline-none placeholder:text-white/60"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="rounded-r-[4px] bg-or-clair px-5 font-mono text-[11px] uppercase tracking-[1px] text-[#211B15] transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {status === 'loading' ? '…' : 'OK'}
      </button>
    </form>
  )
}
