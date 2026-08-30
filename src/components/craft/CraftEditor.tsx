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
import { Grid } from './user/Grid';
import { Toolbox } from './Toolbox';
import { SettingsPanel } from './SettingsPanel';
import { Header } from './Header';
import { Viewport } from './Viewport';
import { FloatingTextToolbar } from './FloatingTextToolbar';

interface CraftEditorProps {
  stepData?: any;
  stepId: string;
}

export const CraftEditor = ({ stepData, stepId }: CraftEditorProps) => {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Determine initial layout mode from step content
  let initialMode: 'centered' | 'full' = 'centered';
  if (stepData?.content) {
    try {
      const parsed = typeof stepData.content === 'string' ? JSON.parse(stepData.content) : stepData.content;
      if (parsed?.ROOT?.props?.pageLayoutMode === 'full') {
        initialMode = 'full';
      }
    } catch (e) {}
  }

  const [pageLayoutMode, setPageLayoutMode] = useState<'centered' | 'full'>(initialMode);

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
        Grid,
      }}
    >
      <div className="fixed inset-0 z-[99999] bg-slate-900 text-slate-100 flex flex-col h-screen w-screen overflow-hidden">
        <Header
          stepData={stepData}
          deviceMode={deviceMode}
          setDeviceMode={setDeviceMode}
          pageLayoutMode={pageLayoutMode}
          setPageLayoutMode={setPageLayoutMode}
          stepId={stepId}
        />

        <div className="flex-1 flex overflow-hidden w-full relative">
          <Toolbox />
          <Viewport
            deviceMode={deviceMode}
            pageLayoutMode={pageLayoutMode}
            jsonContent={jsonContent}
          />
          <SettingsPanel />
          <FloatingTextToolbar />
        </div>
      </div>
    </Editor>
  );
};
