'use client';

import React from 'react';
import { useNode, useEditor } from '@craftjs/core';

export interface VideoProps {
  videoUrl?: string;
  caption?: string;
  width?: number;
  height?: number;
}

export const Video = ({
  videoUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  caption = 'Vidéo de démonstration en direct',
  width = 100,
  height,
}: VideoProps) => {
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  const {
    connectors: { connect, drag },
    selected,
    actions: { setProp },
  } = useNode((node) => ({
    selected: node.events.selected,
  }));

  // PUBLIC READ-ONLY VIEW FOR VISITORS
  if (!enabled) {
    return (
      <div
        className="my-8 max-w-3xl mx-auto space-y-2 text-center"
        style={{
          width: `${width}%`,
          minHeight: height ? `${height}px` : undefined,
        }}
      >
        <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-black">
          <iframe
            src={videoUrl}
            title="Vidéo Craft"
            className="w-full h-full border-0"
            allowFullScreen
          />
        </div>
        <p className="text-xs text-slate-500 font-bold italic p-1">
          {caption}
        </p>
      </div>
    );
  }

  // BUILDER EDITOR VIEW
  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      className={`my-8 max-w-3xl mx-auto space-y-2 text-center transition-all ${
        selected ? 'ring-2 ring-[#00A0FF] p-1 rounded-3xl' : ''
      }`}
      style={{
        width: `${width}%`,
        minHeight: height ? `${height}px` : undefined,
      }}
    >
      <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-black">
        <iframe
          src={videoUrl}
          title="Vidéo Craft"
          className="w-full h-full border-0 pointer-events-none"
        />
      </div>
      <p
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => {
          setProp((props: VideoProps) => {
            props.caption = e.currentTarget.innerText;
          });
        }}
        className="text-xs text-slate-500 font-bold italic outline-none focus:ring-2 focus:ring-[#00A0FF] rounded-md p-1 cursor-text"
      >
        {caption}
      </p>
    </div>
  );
};

(Video as any).craft = {
  displayName: 'Intégration Vidéo',
  props: {
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    caption: 'Vidéo de démonstration en direct',
    width: 100,
  },
  rules: {
    canDrag: () => true,
  },
};
