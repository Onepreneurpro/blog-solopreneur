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
  ArrowLeft,
  BookOpen,
  X,
  Pin,
  PanelLeftClose,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarItem {
  label: string;
  href: string;
  icon: any;
}

interface SidebarGroup {
  group: string;
  items: SidebarItem[];
}

interface AdminSidebarProps {
  onToggleSidebar?: () => void;
  isCollapsed?: boolean;
}

const ADMIN_LINKS: SidebarGroup[] = [
  {
    group: 'GÉNÉRAL',
    items: [
      { label: 'Tableau de bord', href: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    group: 'PRODUITS ET RESSOURCES',
    items: [
      { label: 'Commandes & Ventes', href: '/admin/commandes', icon: ShoppingCart },
      { label: 'Ressources & Guides', href: '/admin/ressources', icon: BookOpen },
      { label: 'Boutique des Produits', href: '/admin/produits', icon: ShoppingBag },
      { label: 'Catégories de produits', href: '/admin/categories-produits', icon: Tag },
    ],
  },
  {
    group: 'GESTION CRM & CLIENTS',
    items: [
      { label: 'Gestion des clients', href: '/admin/crm', icon: Users },
      { label: 'Contacts Leads', href: '/admin/leads', icon: UserCheck },
      { label: 'Campagnes d Emails', href: '/admin/campagnes', icon: Megaphone },
      { label: 'Tickets Support', href: '/admin/tickets', icon: LifeBuoy },
    ],
  },
  {
    group: 'CONTENU & ARTICLES',
    items: [
      { label: 'Articles de blog', href: '/admin/articles', icon: FileText },
      { label: 'Catégories', href: '/admin/categories', icon: FolderTree },
      { label: 'Tags', href: '/admin/tags', icon: Tag },
      { label: 'Pages Statiques', href: '/admin/pages', icon: FileCode },
      { label: 'Médiathèque', href: '/admin/medias', icon: ImageIcon },
    ],
  },
  {
    group: 'APPARENCE & THÈMES',
    items: [
      { label: 'Thèmes & Templates', href: '/admin/themes', icon: Palette },
      { label: 'Menus Dynamiques', href: '/admin/menus', icon: MenuIcon },
      { label: 'Page d Accueil Builder', href: '/admin/homepage', icon: Layout },
    ],
  },
  {
    group: 'CONFIGURATION',
    items: [
      { label: 'Paramètres SEO', href: '/admin/seo', icon: Globe },
      { label: 'Paramètres Généraux', href: '/admin/parametres', icon: Settings },
    ],
  },
];

export function AdminSidebar({ onToggleSidebar }: AdminSidebarProps = {}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pinnedHrefs, setPinnedHrefs] = useState<string[]>([]);

  // Load pinned links from localStorage
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

  const togglePin = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    let updated: string[];
    if (pinnedHrefs.includes(href)) {
      updated = pinnedHrefs.filter((h) => h !== href);
    } else {
      updated = [...pinnedHrefs, href];
    }
    setPinnedHrefs(updated);
    try {
      localStorage.setItem('pinnedAdminLinks', JSON.stringify(updated));
      window.dispatchEvent(new Event('pinnedAdminLinksUpdated'));
    } catch (err) {
      console.error(err);
    }
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between w-full">
      <div className="p-3.5 space-y-6">
        
        {/* LOGO */}
        <div className="flex items-center justify-between px-2 pt-2 pb-1 border-b border-slate-100">
          <Link href="/admin" className="flex items-center gap-2 font-heading font-extrabold text-base text-slate-900">
            <span className="w-7 h-7 bg-[#00A0FF] flex items-center justify-center text-white text-xs font-extrabold shadow-sm rounded-md">
              O
            </span>
            <span className="font-extrabold text-slate-900">Onepreneur Admin</span>
          </Link>
          
          <div className="flex items-center gap-1">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                title="Masquer le menu latéral (Ctrl+B)"
                className="hidden md:flex p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="space-y-6 text-xs">
          {ADMIN_LINKS.map((section, idx) => (
            <div key={idx} className="space-y-1.5">
              
              {/* MAIN SECTION HEADER WITH ELECTRIC SKY BLUE BACKGROUND */}
              <div className="px-3.5 py-2.5 bg-[#00A0FF] text-white border-l-4 border-[#0077CC] border-y border-r border-[#0090EE] rounded-none text-[11px] font-heading font-black tracking-wider uppercase shadow-2xs mb-2 flex items-center justify-between">
                <span>{section.group}</span>
                <span className="w-2 h-2 bg-white rounded-none opacity-90" />
              </div>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                  const isPinned = pinnedHrefs.includes(item.href);

                  return (
                    <div key={item.href} className="relative group">
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-none text-xs transition-all ${
                          isActive
                            ? 'admin-link-active bg-[#F1F5F9] text-slate-900 font-extrabold border-l-4 border-[#00A0FF] border-y border-r border-[#CBD5E1] shadow-xs'
                            : 'admin-link-inactive text-slate-800 hover:bg-slate-50 hover:text-slate-950 font-bold border border-transparent hover:border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#00A0FF]' : 'text-slate-600'}`} />
                          <span className="whitespace-normal break-words leading-snug">{item.label}</span>
                        </div>

                        <button
                          onClick={(e) => togglePin(item.href, e)}
                          title={isPinned ? 'Désépingler du bandeau haut' : 'Épingler au bandeau haut'}
                          className={`p-1 rounded-none transition-opacity flex-shrink-0 ml-1 ${
                            isPinned
                              ? 'text-amber-500 opacity-100'
                              : 'text-slate-400 opacity-0 group-hover:opacity-100 hover:text-purple-900'
                          }`}
                        >
                          <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-500 text-amber-600' : ''}`} />
                        </button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* BOTTOM ACTION */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-none text-xs font-bold text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voir le site public</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* MOBILE TRIGGER BUTTON */}
      <div className="md:hidden fixed top-3 left-4 z-50">
        <Button
          onClick={() => setMobileOpen(true)}
          variant="secondary"
          size="sm"
          className="bg-purple-700 text-white border border-purple-800 shadow-lg p-2 rounded-none"
        >
          <MenuIcon className="w-5 h-5" />
        </Button>
      </div>

      {/* DESKTOP SIDEBAR CONTENT */}
      <div className="hidden md:block w-full bg-white">
        {sidebarContent}
      </div>

      {/* MOBILE SIDEBAR MODAL */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 bg-white h-full z-10 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
