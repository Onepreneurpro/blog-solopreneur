'use client';

import React from 'react';
import { Frame, Element } from '@craftjs/core';
import { Container } from './user/Container';
import { Text } from './user/Text';
import { Button } from './user/Button';
import { Image } from './user/Image';
import { FeatureGrid } from './user/FeatureGrid';
import { Card } from './user/Card';
import { LeadForm } from './user/LeadForm';
import { Video } from './user/Video';

interface ViewportProps {
  deviceMode: 'desktop' | 'tablet' | 'mobile';
  pageLayoutMode?: 'centered' | 'full';
  jsonContent?: string | null;
}

export const Viewport = ({
  deviceMode,
  pageLayoutMode = 'centered',
  jsonContent,
}: ViewportProps) => {
  const isFullWidth = pageLayoutMode === 'full';

  const widthClasses = {
    desktop: isFullWidth ? 'w-full min-h-screen rounded-none shadow-none my-0' : 'w-full max-w-5xl rounded-3xl shadow-2xl my-auto',
    tablet: 'w-[768px] rounded-3xl shadow-2xl my-auto',
    mobile: 'w-[375px] rounded-3xl shadow-2xl my-auto',
  };

  const containerPadding = isFullWidth ? 'p-0 sm:p-2' : 'p-6';

  return (
    <div className={`flex-1 bg-slate-100 ${containerPadding} overflow-y-auto flex flex-col items-center min-h-full transition-all`}>
      <div
        className={`bg-white min-h-[800px] transition-all ${widthClasses[deviceMode]}`}
      >
        <Frame data={jsonContent ? JSON.parse(jsonContent) : undefined}>
          <Element is={Container} padding={isFullWidth ? 40 : 32} bgColor="#ffffff" canvas>
            <Text
              text="Bienvenue sur votre Tunnel Beta 2 (Craft.js)"
              fontSize={36}
              textColor="#0f172a"
              textAlign="center"
            />
            <Text
              text="Glissez-déposez n importe quel composant depuis le panneau de gauche et personnalisez-le directement sur la page."
              fontSize={16}
              textColor="#475569"
              textAlign="center"
              fontWeight="normal"
            />
            <Button text="Commencer mon essai gratuit 🚀" align="center" />
            <Image height={320} borderRadius={24} />
            <Text text="Nos Modules & Fonctionnalités" fontSize={28} textAlign="center" textColor="#0f172a" />
            <FeatureGrid columns={4} />
          </Element>
        </Frame>
      </div>
    </div>
  );
};
