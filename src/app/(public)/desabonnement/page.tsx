'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, MailX, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!email) {
      setLoading(false);
      return;
    }

    fetch('/api/leads/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSuccess(true);
          setMsg(data.message || 'Votre désabonnement a été pris en compte.');
        } else {
          setMsg(data.error || 'Erreur lors du désabonnement.');
        }
      })
      .catch((err) => {
        console.error(err);
        setMsg('Erreur de connexion.');
      })
      .finally(() => setLoading(false));
  }, [email]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-slate-50">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-5">
        
        <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center mx-auto shadow-md">
          {success ? <CheckCircle className="w-8 h-8 text-emerald-600" /> : <MailX className="w-8 h-8 text-purple-700" />}
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-heading font-black text-slate-950">
            {success ? 'Désabonnement Confirmé' : 'Désabonnement de la Séquence'}
          </h1>
          {email ? (
            <p className="text-xs text-slate-500 font-medium">
              Adresse concernée : <strong className="text-slate-900">{email}</strong>
            </p>
          ) : null}
        </div>

        {loading ? (
          <div className="p-4 bg-slate-100 rounded-2xl text-xs font-semibold text-slate-600 animate-pulse">
            Traitement de votre demande de désabonnement en cours...
          </div>
        ) : success ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-2xl text-xs font-medium leading-relaxed">
            ✅ {msg || 'Vous avez été retiré(e) de cette séquence. Vous ne recevrez plus d emails automatiques pour cette campagne.'}
          </div>
        ) : (
          <div className="p-4 bg-slate-100 border border-slate-200 text-slate-700 rounded-2xl text-xs font-medium">
            {msg || 'Aucune adresse email spécifiée.'}
          </div>
        )}

        <div className="pt-2">
          <Link href="/">
            <Button size="lg" className="w-full btn-purple font-heading font-black text-xs gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Retour à l accueil Solopreneur&Co</span>
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center p-8">
        <div className="text-sm font-semibold text-slate-500">Chargement...</div>
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}
