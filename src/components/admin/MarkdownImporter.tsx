'use client';

import React, { useRef, useState } from 'react';
import { FileDown, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MarkdownImporterProps {
  onImport: (data: { title?: string; excerpt?: string; content: string }) => void;
}

export function MarkdownImporter({ onImport }: MarkdownImporterProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const parseMarkdown = (rawText: string) => {
    let title: string | undefined = undefined;
    let excerpt: string | undefined = undefined;
    let bodyText = rawText;

    // 1. Extract Frontmatter (--- ... ---) if present
    const frontmatterRegex = /^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*[\r\n]+/;
    const match = rawText.match(frontmatterRegex);

    if (match) {
      const frontmatterStr = match[1];
      bodyText = rawText.replace(frontmatterRegex, '');

      frontmatterStr.split(/[\r\n]+/).forEach((line) => {
        const colonIdx = line.indexOf(':');
        if (colonIdx !== -1) {
          const key = line.slice(0, colonIdx).trim().toLowerCase();
          const val = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
          if (key === 'title') title = val;
          if (key === 'excerpt' || key === 'description') excerpt = val;
        }
      });
    }

    // 2. If no title in frontmatter, extract first H1 (# Title)
    if (!title) {
      const h1Match = bodyText.match(/^#\s+(.+)$/m);
      if (h1Match) {
        title = h1Match[1].trim();
        bodyText = bodyText.replace(/^#\s+(.+)$/m, '');
      }
    }

    // 3. Convert Markdown syntax to HTML for RichTextEditor
    let html = bodyText
      // Image parsing: ![alt](url) -> <img src="url" alt="alt" />
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<p><img src="$2" alt="$1" style="max-width:100%; border-radius:12px; margin: 16px 0;" /></p>')
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Links (processed after images)
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // Bold & Italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Unordered lists
      .replace(/^\s*-\s+(.*$)/gim, '<ul><li>$1</li></ul>')
      .replace(/<\/ul>\s*<ul>/g, '') // Merge adjacent lists
      .replace(/\n\n+/g, '</p><p>')
      .replace(/([^>\r\n]?)(\r\n|\n)/g, '$1<br />');

    if (!html.startsWith('<h') && !html.startsWith('<p') && !html.startsWith('<ul')) {
      html = `<p>${html}</p>`;
    }

    return { title, excerpt, content: html };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setSuccessMsg('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) throw new Error('Le fichier est vide.');

        const parsed = parseMarkdown(text);
        onImport(parsed);
        setSuccessMsg(`Fichier "${file.name}" importé avec succès !`);

        setTimeout(() => setSuccessMsg(''), 4000);
      } catch (err: any) {
        setErrorMsg(err.message || 'Erreur lors de la lecture du fichier.');
      }
    };

    reader.onerror = () => {
      setErrorMsg('Erreur d ouverture du fichier.');
    };

    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        ref={fileInputRef}
        accept=".md,.markdown,.txt"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="gap-2 text-xs font-bold border-purple-300 text-purple-900 bg-purple-50 hover:bg-purple-100 shadow-sm"
        >
          <FileDown className="w-4 h-4 text-purple-600" />
          <span>Importer un article Markdown (.md)</span>
        </Button>

        <span className="text-[11px] text-slate-400">
          (Importe le titre, images <code className="font-mono text-purple-400">![alt](url)</code> et met en forme le texte)
        </span>
      </div>

      {successMsg && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2 font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2 font-semibold">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
