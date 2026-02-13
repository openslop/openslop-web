'use client';

import { useState, FormEvent } from 'react';
import confetti from 'canvas-confetti';
import Image from 'next/image';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    const trimmed = email.trim();
    if (!trimmed) {
      setError('Please enter your email');
      return;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setError('Please enter a valid email');
      return;
    }

    setStatus('submitting');

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });

      if (res.status === 409) {
        setError('You\'re already on the waitlist!');
        setStatus('idle');
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Something went wrong');
        setStatus('error');
        return;
      }

      setStatus('success');
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch {
      setError('Something went wrong. Please try again.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-5 backdrop-blur-sm">
          <p className="text-lg font-semibold text-white">Thanks &mdash; we&apos;ll call you soon</p>
          <p className="mt-2 text-sm text-zinc-400">Want priority access?</p>
          <button
            className="mt-3 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
            onClick={() => {}}
          >
            Tell us more
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row sm:items-start gap-3">
        <div className="flex-1 min-w-0">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError('');
            }}
            placeholder="Enter your email"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 outline-none transition-colors focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50"
          />
          {error && (
            <p className="mt-1.5 text-sm text-red-400">{error}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="shrink-0 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-6 py-3 font-semibold text-white transition-all hover:from-violet-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'submitting' ? 'Joining...' : 'Join Beta'}
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex -space-x-2 shrink-0">
          {[1, 2, 3, 4].map((i) => (
            <Image
              key={i}
              src={`/avatars/placeholder-${i}.svg`}
              alt=""
              width={32}
              height={32}
              className="rounded-full ring-2 ring-[#0a0a0a]"
            />
          ))}
        </div>
        <p className="text-sm text-zinc-400">
          Join <span className="text-white font-medium">2,000+</span> creators on the waitlist
        </p>
      </div>
    </div>
  );
}
