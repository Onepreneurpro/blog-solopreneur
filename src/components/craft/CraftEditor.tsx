'use client';

import React, { useState } from 'react';
import { Editor } from '@craftjs/core';
import { Container } from './user/Container';
import { Text } from './user/Text';
import { Button } from './user/Button';
import { Image } from './user/Image';
import { FeatureGrid } from './user/FeatureGrid';
import { Card } from './user/Card';
import { LeadForm } from './user/LeadForm';
import { Video } from './user/Video';
import { Toolbox } from './Toolbox';
import { SettingsPanel } from './SettingsPanel';
import { Header } from './Header';
import { Viewport } from './Viewport';

interface CraftEditorProps {
  stepData?: any;
  stepId: string;
}

export const CraftEditor = ({ stepData, stepId }: CraftEditorProps) => {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const jsonContent = stepData?.content;

  return (
    <Editor
      resolver={{
        Container,
        Text,
        Button,
        Image,
        FeatureGrid,
        Card,
        LeadForm,
        Video,
      }}
    >
      <div className="fixed inset-0 z-[99999] bg-slate-900 text-slate-100 flex flex-col h-screen w-screen overflow-hidden">
        <Header
          stepData={stepData}
          deviceMode={deviceMode}
          setDeviceMode={setDeviceMode}
          stepId={stepId}
        />

        <div className="flex-1 flex overflow-hidden w-full relative">
          <Toolbox />
          <Viewport deviceMode={deviceMode} jsonContent={jsonContent} />
          <SettingsPanel />
        </div>
      </div>
    </Editor>
  );
};
