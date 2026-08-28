'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@solopreneur.io');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fillAdminCreds = () => {
    setEmail('admin@solopreneur.io');
    setPassword('admin123');
  };

  const fillClientCreds = () => {
    setEmail('client@solopreneur.io');
    setPassword('client123');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur d authentification');
      }

      if (data.user.role === 'ADMIN' || data.user.role === 'EDITOR') {
        router.push('/admin');
      } else {
        router.push('/compte');
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 bg-slate-50 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full px-4 space-y-6">
        
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white font-extrabold text-xl mx-auto shadow-md shadow-purple-900/20">
              S
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Connexion à votre espace</h1>
            <p className="text-xs text-slate-500">
              Accédez à votre espace client ou à votre interface d administration.
            </p>
          </div>

          {/* QUICK DEMO CREDENTIALS SELECTOR */}
          <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-3">
            <div className="text-xs font-bold text-purple-950 flex items-center justify-between">
              <span>Identifiants de démonstration :</span>
              <span className="text-[10px] bg-purple-200 text-purple-900 font-extrabold px-2 py-0.5 rounded">1-Clic</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* ADMIN SELECTOR */}
              <button
                type="button"
                onClick={fillAdminCreds}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  email === 'admin@solopreneur.io'
                    ? 'border-purple-600 bg-white ring-2 ring-purple-500/20 font-bold'
                    : 'border-purple-100 bg-white/60 hover:bg-white'
                }`}
              >
                <div className="text-xs font-extrabold text-slate-900">👑 Administrateur</div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">admin@solopreneur.io</div>
                <div className="text-[10px] text-purple-700 font-semibold">Pass: admin123</div>
              </button>

              {/* CLIENT SELECTOR */}
              <button
                type="button"
                onClick={fillClientCreds}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  email === 'client@solopreneur.io'
                    ? 'border-purple-600 bg-white ring-2 ring-purple-500/20 font-bold'
                    : 'border-purple-100 bg-white/60 hover:bg-white'
                }`}
              >
                <div className="text-xs font-extrabold text-slate-900">👤 Compte Client</div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">client@solopreneur.io</div>
                <div className="text-[10px] text-purple-700 font-semibold">Pass: client123</div>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Adresse E-mail</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mot de passe</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              size="md"
              className="w-full btn-purple font-extrabold py-3.5 rounded-xl shadow-lg gap-2"
            >
              <span>{loading ? 'Connexion en cours...' : 'Se connecter'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

        </div>

      </div>
    </div>
  );
}
