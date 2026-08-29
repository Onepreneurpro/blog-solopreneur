import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import FunnelPublicClient from './FunnelPublicClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    funnelSlug: string;
    stepSlug: string;
  };
}

export default async function PublicFunnelStepPage({ params }: PageProps) {
  const funnel = await prisma.funnel.findUnique({
    where: { slug: params.funnelSlug },
    include: {
      steps: {
        where: { isActive: true },
        orderBy: { position: 'asc' },
      },
    },
  });

  if (!funnel) {
    notFound();
  }

  const step = funnel.steps.find((s) => s.slug === params.stepSlug);

  if (!step) {
    notFound();
  }

  // Increment view count asynchronously
  await prisma.funnelStep.update({
    where: { id: step.id },
    data: { viewsCount: { increment: 1 } },
  });

  return (
    <FunnelPublicClient
      funnel={funnel}
      step={step}
    />
  );
}
