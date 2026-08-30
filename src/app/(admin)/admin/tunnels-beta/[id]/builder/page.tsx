'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Puck, Data } from '@measured/puck';
import '@measured/puck/puck.css';
import { puckConfig } from '@/lib/puck/config';
import { ArrowLeft, Save, Globe, Eye, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function PuckBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const stepId = params.id as string;

  const [stepData, setStepData] = useState<any>(null);
  const [initialData, setInitialData] = useState<Data>({
    content: [
      {
        type: 'Hero',
        props: {
          id: 'hero-1',
          title: 'Bienvenue sur votre Tunnel Beta (Éditeur Puck)',
          subtitle: 'Faites glisser et déposez vos composants visuels directement depuis le panneau de gauche.',
          buttonText: 'Commencer mon essai gratuit 🚀',
          buttonLink: '#',
          bgGradient: 'from-blue-600 to-indigo-900',
          imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
        },
      },
      {
        type: 'Feature4ColImg',
        props: {
          id: 'feat-4col-1',
          item1Title: 'BASES',
          item1Desc: 'Masterisez les fondations essentielles de la réussite.',
          item1Img: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=400&q=80',
          item2Title: 'CUISINER',
          item2Desc: 'Recettes et formules étape par étape prêtes à l emploi.',
          item2Img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
          item3Title: 'EXTÉRIEUR',
          item3Desc: 'Développez votre visibilité et votre autorité externe.',
          item3Img: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80',
          item4Title: 'DRESSAGE',
          item4Desc: 'Optimisez vos processus et automatisez vos résultats.',
          item4Img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80',
          imgHeight: 240,
          borderRadius: 16,
        },
      },
    ],
    root: { props: { title: 'Page Tunnel Beta' } },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchStepData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/funnel-steps/${stepId}`);
        const data = await res.json();
        if (data.step) {
          setStepData(data.step);
          if (data.step.content) {
            try {
              const parsed = typeof data.step.content === 'string'
                ? JSON.parse(data.step.content)
                : data.step.content;
              if (parsed && parsed.content) {
                setInitialData(parsed);
              }
            } catch (err) {
              console.log('Using default puck initial data:', err);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load step data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (stepId) {
      fetchStepData();
    }
  }, [stepId]);

  const handlePublish = async (data: Data) => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch(`/api/admin/funnel-steps/${stepId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: JSON.stringify(data),
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#00A0FF] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold tracking-wider text-slate-400">Chargement de l Éditeur Puck Beta...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* TOP HEADER */}
      <header className="h-14 bg-slate-950 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/tunnels-beta"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#00A0FF]" />
            <span>Tunnels Beta</span>
          </Link>

          <div className="h-4 w-px bg-slate-800" />

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white font-heading">
                {stepData?.name || 'Étape Tunnel Beta'}
              </span>
              <span className="text-[9px] font-mono font-bold bg-[#00A0FF]/20 text-[#00A0FF] border border-[#00A0FF]/40 px-2 py-0.5 rounded-full">
                PUCK EDITOR BETA
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/80 border border-emerald-800 px-3 py-1 rounded-xl animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Sauvegardé avec succès !</span>
            </span>
          )}

          {stepData?.funnel && (
            <a
              href={`/funnel/${stepData.funnel.slug}/${stepData.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
            >
              <Eye className="w-4 h-4 text-purple-400" />
              <span>Aperçu Public</span>
            </a>
          )}
        </div>
      </header>

      {/* PUCK EDITOR FULLSCREEN WORKSPACE */}
      <div className="flex-1 w-full relative bg-slate-100 text-slate-900">
        <style jsx global>{`
          .Puck-component input,
          .Puck-component textarea,
          .Puck-component label,
          .Puck-component button,
          [data-puck-component] input,
          [data-puck-component] textarea,
          [data-puck-component] label,
          [data-puck-component] button,
          input, textarea {
            pointer-events: auto !important;
          }
        `}</style>
        <Puck
          config={puckConfig}
          data={initialData}
          onPublish={handlePublish}
          headerTitle={`Éditeur Puck - ${stepData?.name || 'Tunnel Beta'}`}
        />
      </div>
    </div>
  );
}
