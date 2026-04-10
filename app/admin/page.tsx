'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push('/admin/dashboard');
    } else {
      setError('Nieprawidłowe hasło.');
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center text-2xl font-black text-white">Panel admina</h1>
        <p className="mb-8 text-center text-sm text-zinc-400">Zaloguj się aby zobaczyć statystyki</p>

        <form onSubmit={handleSubmit} className="rounded-2xl bg-zinc-900 p-8 shadow-xl">
          <label className="mb-1 block text-sm font-medium text-zinc-300">Hasło</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="mb-4 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
            placeholder="••••••••"
            required
            autoFocus
          />

          {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-orange-500 py-2.5 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? 'Logowanie…' : 'Zaloguj się'}
          </button>
        </form>
      </div>
    </div>
  );
}
