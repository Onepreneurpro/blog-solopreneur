'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { GripVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

const BLOCK_MODELS_DRAGGABLE = [
  { key: 'HERO', label: '🚀 HERO', title: 'Section Héro', color: 'bg-[#00A0FF] text-white border-[#0077CC] font-extrabold shadow-xs' },
  { key: 'TICKER', label: '🟡 TICKER', title: 'Bandeau Fluo', color: 'bg-amber-400 text-slate-950 border-amber-500 font-extrabold shadow-xs' },
  { key: 'CATEGORIES', label: '📦 COLLECTIONS', title: 'Collections', color: 'bg-indigo-100 text-indigo-950 border-indigo-300 font-extrabold shadow-xs' },
  { key: 'PRODUCTS', label: '🛒 BOUTIQUE', title: 'Produits', color: 'bg-blue-100 text-blue-950 border-blue-300 font-extrabold shadow-xs' },
  { key: 'DARK_FEATURE', label: '🎁 EBOOK', title: 'Offre eBook', color: 'bg-emerald-100 text-emerald-950 border-emerald-300 font-extrabold shadow-xs' },
  { key: 'FREE_RESOURCES', label: '📚 GUIDES', title: 'Ressources', color: 'bg-purple-100 text-purple-950 border-purple-300 font-extrabold shadow-xs' },
  { key: 'ARTICLES', label: '📰 ARTICLES', title: 'Blog', color: 'bg-slate-100 text-slate-900 border-slate-300 font-extrabold shadow-xs' },
  { key: 'TESTIMONIALS', label: '💬 AVIS', title: 'Témoignages', color: 'bg-rose-100 text-rose-950 border-rose-300 font-extrabold shadow-xs' },
  { key: 'NEWSLETTER', label: '📬 NEWSLETTER', title: 'Email', color: 'bg-sky-100 text-sky-950 border-sky-300 font-extrabold shadow-xs' },
  { key: 'FINAL_CTA', label: '⚡ FINAL CTA', title: 'CTA Final', color: 'bg-[#00A0FF] text-white border-[#0077CC] font-extrabold shadow-xs' },
];

interface AdminLayoutClientProps {
  user: {
    name?: string | null;
    email: string;
    role: string;
  };
  children: React.ReactNode;
}

export function AdminLayoutClient({ user, children }: AdminLayoutClientProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const pathname = usePathname();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('adminSidebarCollapsed');
      if (saved !== null) {
        setSidebarCollapsed(JSON.parse(saved));
      }
      const savedDock = localStorage.getItem('adminDockCollapsed');
      if (savedDock !== null) {
        setDockCollapsed(JSON.parse(savedDock));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const nextState = !prev;
      try {
        localStorage.setItem('adminSidebarCollapsed', JSON.stringify(nextState));
      } catch (e) {
        console.error(e);
      }
      return nextState;
    });
  };

  const toggleDock = () => {
    setDockCollapsed((prev) => {
      const nextState = !prev;
      try {
        localStorage.setItem('adminDockCollapsed', JSON.stringify(nextState));
      } catch (e) {
        console.error(e);
      }
      return nextState;
    });
  };

  const scrollDock = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle sidebar like VS Code / Antigravity
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Bypass outer AdminLayout for full-screen builder pages
  if (pathname?.includes('/builder')) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-100 text-slate-900 overflow-x-hidden relative pb-24">
      {/* LEFT NAVIGATION SIDEBAR - PURE ORIGINAL FULL-SIZE MENU */}
      <aside
        className={`hidden md:block transition-all duration-300 ease-in-out shrink-0 bg-white border-r border-slate-200 min-h-screen ${
          sidebarCollapsed ? 'w-0 opacity-0 overflow-hidden border-r-0' : 'w-72 opacity-100'
        }`}
      >
        <AdminSidebar onToggleSidebar={toggleSidebar} isCollapsed={sidebarCollapsed} />
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 w-full transition-all duration-300">
        <AdminHeader
          user={user}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={toggleSidebar}
        />
        <main className="p-4 sm:p-6 lg:p-8 flex-1 w-full max-w-none pb-28">{children}</main>
      </div>

      {/* BOTTOM FIXED FLOATING BAR FOR ALL 10 BLOCK MODELS WITH TOGGLE MINIMIZE/EXPAND (HORIZONTAL CHEVRONS) */}
      {pathname === '/admin/homepage' && (
        dockCollapsed ? (
          /* COLLAPSED COMPACT PILL BUTTON AT BOTTOM LEFT WITH RIGHT CHEVRON (▶) */
          <button
            onClick={toggleDock}
            className="fixed bottom-3 left-4 z-50 bg-white/95 text-slate-900 backdrop-blur-xl border-2 border-[#00A0FF] shadow-[0_10px_30px_rgba(0,160,255,0.25)] rounded-xl px-4 py-2 flex items-center gap-2.5 text-xs font-heading font-black hover:scale-105 transition-all cursor-pointer animate-in fade-in slide-in-from-left duration-200"
            title="Dérouler la bibliothèque de modèles de blocs"
          >
            <span className="w-6 h-6 rounded-md bg-[#00A0FF] text-white flex items-center justify-center text-xs font-black shadow-xs">
              📦
            </span>
            <span className="text-[#00A0FF] tracking-wider uppercase font-black">MODÈLES DE BLOCS (10)</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#00A0FF]/15 text-[#00A0FF] border border-[#00A0FF]/30 font-mono font-bold">
              + Dérouler
            </span>
            <ChevronRight className="w-4 h-4 text-[#00A0FF]" />
          </button>
        ) : (
          /* EXPANDED FULL DOCK BAR WITH LEFT CHEVRON MINIMIZE BUTTON (◀) */
          <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-50 w-[98%] max-w-[1440px] bg-white/95 text-slate-900 backdrop-blur-xl border-2 border-[#00A0FF] shadow-[0_20px_50px_rgba(15,23,42,0.2)] rounded-xl p-2 sm:px-3 flex items-center justify-between gap-1.5 animate-in slide-in-from-bottom duration-300">
            {/* LEFT COMPACT TITLE BADGE */}
            <div className="flex items-center gap-1.5 shrink-0 pr-2 border-r border-slate-200">
              <span className="w-7 h-7 rounded-md bg-[#00A0FF] text-white flex items-center justify-center font-black text-xs shadow-md">
                📦
              </span>
              <div className="flex items-center gap-1">
                <h3 className="text-[10px] font-heading font-black text-[#00A0FF] uppercase tracking-wider hidden lg:block">
                  BLOCS
                </h3>
                <span className="text-[9px] font-mono font-bold bg-[#00A0FF]/15 text-[#00A0FF] px-1.5 py-0.5 rounded-md border border-[#00A0FF]/30">
                  10
                </span>
              </div>
            </div>

            {/* SCROLL LEFT ARROW BUTTON */}
            <button
              onClick={() => scrollDock('left')}
              className="p-1 rounded-md text-slate-500 hover:text-[#00A0FF] hover:bg-slate-100 transition-colors shrink-0"
              title="Défiler vers la gauche"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* HORIZONTAL SCROLLABLE STACK OF ALL 10 BLOCK MODEL CHIPS */}
            <div
              ref={scrollContainerRef}
              className="flex items-center gap-1.5 overflow-x-auto py-0.5 flex-1 scroll-smooth no-scrollbar"
            >
              {BLOCK_MODELS_DRAGGABLE.map((b) => (
                <button
                  key={b.key}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'NEW_BLOCK', sectionKey: b.key }));
                  }}
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('addSectionFromSidebar', { detail: { sectionKey: b.key } }));
                  }}
                  className={`px-2.5 py-1.5 rounded-md text-[10px] font-heading border cursor-grab active:cursor-grabbing flex items-center gap-1 shrink-0 transition-all shadow-xs hover:scale-105 active:scale-95 ${b.color}`}
                  title={`Ajouter ${b.title} (glissez sur la page ou cliquez)`}
                >
                  <GripVertical className="w-3 h-3 opacity-60 shrink-0" />
                  <span className="font-extrabold whitespace-nowrap">{b.label}</span>
                  <span className="text-[8px] px-1 py-0.5 rounded-md font-mono font-black bg-white/90 text-slate-900 border border-slate-300 ml-0.5 shrink-0 shadow-2xs">
                    +
                  </span>
                </button>
              ))}
            </div>

            {/* SCROLL RIGHT ARROW BUTTON */}
            <button
              onClick={() => scrollDock('right')}
              className="p-1 rounded-lg text-slate-500 hover:text-[#00A0FF] hover:bg-slate-100 transition-colors shrink-0"
              title="Défiler vers la droite"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* TOGGLE MINIMIZE BUTTON WITH LEFT CHEVRON (◀) */}
            <button
              onClick={toggleDock}
              title="Réduire le bandeau de modèles de blocs"
              className="p-1.5 rounded-xl text-slate-600 hover:text-[#00A0FF] hover:bg-slate-100 border border-slate-300 transition-colors shrink-0 ml-1 flex items-center gap-1 text-[10px] font-bold"
            >
              <ChevronLeft className="w-4 h-4 text-[#00A0FF]" />
              <span className="hidden sm:inline text-slate-700">Réduire</span>
            </button>
          </div>
        )
      )}
    </div>
  );
}
