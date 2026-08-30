'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CraftEditor } from '@/components/craft/CraftEditor';

export default function CraftBuilderPage() {
  const params = useParams();
  const stepId = params.id as string;

  const [stepData, setStepData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStepData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/funnel-steps/${stepId}`);
        const data = await res.json();
        if (data.step) {
          setStepData(data.step);
        }
      } catch (err) {
        console.error('Failed to fetch step data for Craft.js:', err);
      } finally {
        setLoading(false);
      }
    };

    if (stepId) {
      fetchStepData();
    }
  }, [stepId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[99999] bg-slate-950 text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#00A0FF] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold tracking-wider text-slate-400">
          Chargement du Créateur Craft.js Beta 2...
        </p>
      </div>
    );
  }

  return <CraftEditor stepData={stepData} stepId={stepId} />;
}
