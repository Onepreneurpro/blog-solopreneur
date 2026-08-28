'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Tag,
  FileCode,
  Image as ImageIcon,
  ShoppingBag,
  ShoppingCart,
  Menu as MenuIcon,
  Layout,
  Globe,
  Settings,
  Palette,
  Users,
  UserCheck,
  Megaphone,
  LifeBuoy,
  BookOpen,
  Pin,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

const ADMIN_LINKS_MAP: Record<string, { label: string; icon: any }> = {
  '/admin': { label: 'Tableau de bord', icon: LayoutDashboard },
  '/admin/commandes': { label: 'Commandes & Ventes', icon: ShoppingCart },
  '/admin/ressources': { label: 'Ressources & Guides', icon: BookOpen },
  '/admin/produits': { label: 'Boutique des Produits', icon: ShoppingBag },
  '/admin/categories-produits': { label: 'Catégories de produits', icon: Tag },
  '/admin/crm': { label: 'Gestion des clients', icon: Users },
  '/admin/leads': { label: 'Contacts Leads', icon: UserCheck },
  '/admin/campagnes': { label: 'Campagnes d Emails', icon: Megaphone },
  '/admin/tickets': { label: 'Tickets Support', icon: LifeBuoy },
  '/admin/articles': { label: 'Articles de blog', icon: FileText },
  '/admin/categories': { label: 'Catégories', icon: FolderTree },
  '/admin/tags': { label: 'Tags', icon: Tag },
  '/admin/pages': { label: 'Pages Statiques', icon: FileCode },
  '/admin/medias': { label: 'Médiathèque', icon: ImageIcon },
  '/admin/themes': { label: 'Thèmes & Templates', icon: Palette },
  '/admin/menus': { label: 'Menus Dynamiques', icon: MenuIcon },
  '/admin/homepage': { label: 'Page d Accueil Builder', icon: Layout },
  '/admin/seo': { label: 'Paramètres SEO', icon: Globe },
  '/admin/parametres': { label: 'Paramètres Généraux', icon: Settings },
};

interface AdminHeaderProps {
  user: {
    name?: string | null;
    email: string;
    role: string;
  };
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function AdminHeader({ user, sidebarCollapsed = false, onToggleSidebar }: AdminHeaderProps) {
  const pathname = usePathname();
  const [pinnedHrefs, setPinnedHrefs] = useState<string[]>([]);

  const loadPinned = () => {
    try {
      const saved = localStorage.getItem('pinnedAdminLinks');
      if (saved) {
        setPinnedHrefs(JSON.parse(saved));
      } else {
        setPinnedHrefs(['/admin/campagnes', '/admin/leads']);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadPinned();
    const handleUpdate = () => loadPinned();
    window.addEventListener('pinnedAdminLinksUpdated', handleUpdate);
    return () => window.removeEventListener('pinnedAdminLinksUpdated', handleUpdate);
  }, []);

  const unpinItem = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = pinnedHrefs.filter((h) => h !== href);
    setPinnedHrefs(updated);
    try {
      localStorage.setItem('pinnedAdminLinks', JSON.stringify(updated));
      window.dispatchEvent(new Event('pinnedAdminLinksUpdated'));
    } catch (err) {
      console.error(err);
    }
  };

  const pinnedItems = pinnedHrefs
    .map((href) => ({ href, ...ADMIN_LINKS_MAP[href] }))
    .filter((item) => item.label && item.icon);

  return (
    <header className="admin-header bg-slate-950 !text-white border-b border-slate-800 px-4 sm:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 pl-14 md:pl-8 shadow-sm">
      
      {/* LEFT COLUMN: TITLE & HIGH-CONTRAST PINNED SHORTCUTS DIRECTLY UNDERNEATH */}
      <div className="space-y-2.5">
        {/* TITLE ROW WITH TOGGLE SIDEBAR BUTTON WHEN COLLAPSED */}
        <div className="flex items-center gap-2.5">
          {sidebarCollapsed && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all shadow-xs flex items-center gap-1.5 text-xs font-heading font-bold"
              title="Afficher le menu latéral (Ctrl+B)"
            >
              <PanelLeftOpen className="w-4 h-4 text-[#a3e635]" />
              <span className="text-[11px] text-[#a3e635] font-black">Menu</span>
            </button>
          )}

          <span className="w-2.5 h-2.5 rounded-full bg-[#a3e635] animate-pulse" />
          <h2 className="text-xs sm:text-sm font-heading font-black !text-white uppercase tracking-wider truncate flex items-center gap-2">
            <span>ESPACE D'ADMINISTRATION —</span>
            <span className="bg-[#a3e635] text-slate-950 px-2.5 py-0.5 rounded text-[11px] font-mono font-black shadow-xs">
              {user.role}
            </span>
          </h2>
        </div>

        {/* HIGH-CONTRAST PINNED SHORTCUTS ROW DIRECTLY UNDER TITLE */}
        {pinnedItems.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-0.5">
            <div className="inline-flex items-center gap-1 bg-amber-400 text-slate-950 px-2.5 py-1 rounded-md text-[10px] font-heading font-black uppercase tracking-wider shadow-xs">
              <Pin className="w-3 h-3 fill-slate-950 text-slate-950 shrink-0" />
              <span>Épinglés</span>
            </div>

            {pinnedItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

              return (
                <div
                  key={`header-pinned-${item.href}`}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-heading font-black transition-all shadow-sm ${
                    isActive
                      ? 'bg-[#a3e635] text-slate-950 border border-[#a3e635] ring-2 ring-[#a3e635]/40'
                      : 'bg-white text-slate-950 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1.5 font-black hover:opacity-90"
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-purple-700'}`} />
                    <span>{item.label}</span>
                  </Link>

                  <button
                    onClick={(e) => unpinItem(item.href, e)}
                    title="Désépingler"
                    className="p-0.5 ml-0.5 rounded text-slate-500 hover:text-rose-600 hover:bg-slate-200/60 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RIGHT USER BADGE */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2 bg-slate-900 !text-white px-3.5 py-1.5 rounded-xl border border-slate-800 font-extrabold text-xs shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{user.name || user.email}</span>
        </div>
      </div>
    </header>
  );
}
