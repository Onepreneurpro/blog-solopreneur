'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, ShoppingBag, Menu as MenuIcon, X, ChevronDown, Zap, LogOut, FileText, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MenuItemType {
  id: string;
  title: string;
  url: string;
  type?: string;
  parentId?: string | null;
  children?: MenuItemType[];
}

interface HeaderProps {
  user?: { name?: string | null; email: string; role: string } | null;
  menuItems?: MenuItemType[];
}

export function Header({ user, menuItems: initialMenuItems = [] }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dynamicHeaderItems, setDynamicHeaderItems] = useState<MenuItemType[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  useEffect(() => {
    // 1. Fetch Dynamic Menus
    fetch('/api/admin/menus')
      .then((res) => res.json())
      .then((data) => {
        if (data.menus) {
          const headerMenu = data.menus.find((m: any) => m.location === 'HEADER');
          if (headerMenu && headerMenu.items && headerMenu.items.length > 0) {
            setDynamicHeaderItems(headerMenu.items);
          }
        }
      })
      .catch(() => {});

    // 2. Fetch Unread Notifications (Messages & Ticket Replies) for logged in customer
    if (user) {
      Promise.all([
        fetch('/api/account/messages').then((res) => res.json()).catch(() => ({ messages: [] })),
        fetch('/api/account/tickets').then((res) => res.json()).catch(() => ({ tickets: [] })),
      ]).then(([msgData, tckData]) => {
        const unreadMsgs = (msgData.messages || []).filter((m: any) => {
          if (m.customerIsRead) return false;
          const lastReply = m.replies && m.replies.length > 0 ? m.replies[m.replies.length - 1] : null;
          if (lastReply) {
            return lastReply.sender === 'ADMIN';
          }
          return true;
        }).length;

        const unreadTcks = (tckData.tickets || []).filter(
          (t: any) => t.status !== 'RESOLVED' && t.replies && t.replies.some((r: any) => r.sender === 'ADMIN')
        ).length;

        setUnreadNotificationsCount(unreadMsgs + unreadTcks);
      });
    }

    const handleNotificationsRead = () => {
      setUnreadNotificationsCount(0);
    };

    window.addEventListener('notifications-read', handleNotificationsRead);
    return () => window.removeEventListener('notifications-read', handleNotificationsRead);
  }, [user]);

  const itemsToUse = dynamicHeaderItems.length > 0 ? dynamicHeaderItems : (initialMenuItems.length > 0 ? initialMenuItems : [
    { id: '1', title: 'Accueil', url: '/', type: 'CUSTOM' },
    { id: '2', title: 'Blog', url: '/blog', type: 'CUSTOM' },
    { id: '3', title: 'Ressources', url: '/ressources', type: 'CUSTOM' },
    { id: '4', title: 'Boutique', url: '/boutique', type: 'CUSTOM' },
  ]);

  // Build hierarchical tree for sub-menus
  const rootNavItems: (MenuItemType & { children: MenuItemType[] })[] = [];
  const map: { [id: string]: MenuItemType & { children: MenuItemType[] } } = {};

  itemsToUse.forEach((item) => {
    map[item.id] = { ...item, children: [] };
  });

  itemsToUse.forEach((item) => {
    if (item.parentId && map[item.parentId]) {
      map[item.parentId].children.push(map[item.id]);
    } else {
      if (map[item.id]) {
        rootNavItems.push(map[item.id]);
      }
    }
  });

  return (
    <div className="sticky top-0 z-50">
      
      {/* ANNOUNCEMENT TICKER BAR */}
      <div className="ticker-bar-lime py-1.5 px-3 sm:px-4 text-center font-extrabold text-[11px] sm:text-xs flex items-center justify-center gap-2 sm:gap-3 overflow-hidden shadow-sm">
        <span className="flex items-center gap-1.5 truncate">
          <Zap className="w-3.5 h-3.5 fill-current flex-shrink-0" />
          <span>Nouveau : Formations & Templates IA 2026</span>
        </span>
        <span className="hidden md:inline">•</span>
        <span className="hidden md:inline">Boostez votre TJM & automatisez votre activité</span>
        <Link href="/boutique" className="underline hover:opacity-80 ml-1 flex-shrink-0">
          Découvrir →
        </Link>
      </div>

      <header className="bg-[#090d16]/95 backdrop-blur-xl border-b border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* LOGO */}
            <Link href="/" className="flex items-center gap-2 font-heading font-extrabold text-lg sm:text-xl tracking-tight text-white">
              <span className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-md bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-500 flex items-center justify-center text-white font-black text-base sm:text-lg shadow-lg shadow-purple-500/30">
                S
              </span>
              <span>Solopreneur<span className="text-violet-500">&Co</span></span>
            </Link>

            {/* DESKTOP NAVIGATION WITH 100% DYNAMIC DROPDOWNS */}
            <nav className="hidden md:flex items-center gap-1">
              {rootNavItems.map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                
                if (hasChildren) {
                  return (
                    <div key={item.id} className="relative group">
                      <Link
                        href={item.url}
                        className="flex items-center gap-1 px-3.5 py-2 text-sm font-semibold rounded-md transition-all text-slate-200 hover:text-white"
                      >
                        {item.title}
                        <ChevronDown className="w-4 h-4 opacity-70 group-hover:rotate-180 transition-transform" />
                      </Link>

                      {/* SUB-MENU DROPDOWN */}
                      <div className="absolute left-0 top-full pt-2 w-64 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-50">
                        <div className="mega-menu-dropdown bg-slate-900/95 backdrop-blur-2xl rounded-md shadow-2xl border border-slate-800 p-2 grid gap-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.id}
                              href={child.url}
                              className="flex items-center gap-2.5 p-2.5 rounded-md transition-colors hover:bg-purple-950/40 text-slate-200 hover:text-white"
                            >
                              <FileText className="w-4 h-4 text-purple-400 flex-shrink-0" />
                              <div className="text-sm font-semibold">{child.title}</div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.id}
                    href={item.url}
                    className="px-3.5 py-2 text-sm font-semibold rounded-md transition-all text-slate-200 hover:text-white"
                  >
                    {item.title}
                  </Link>
                );
              })}
            </nav>

            {/* DESKTOP ACTIONS WITH LIVE UNREAD BADGE */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-2">
                  <Link href="/compte">
                    <Button variant="primary" size="sm" className="btn-purple flex items-center gap-1.5 rounded-md font-extrabold px-4 py-2 shadow-md relative">
                      <User className="w-4 h-4" />
                      <span>Mon Compte</span>
                      {unreadNotificationsCount > 0 && (
                        <span className="ml-1 px-2 py-0.5 text-[10px] font-black bg-amber-400 text-amber-950 rounded-full animate-bounce shadow-sm">
                          {unreadNotificationsCount}
                        </span>
                      )}
                    </Button>
                  </Link>

                  <form action="/api/auth/logout" method="POST">
                    <Button type="submit" variant="danger" size="sm" className="header-logout-btn flex items-center gap-1.5 rounded-md font-bold px-4 py-2 text-xs">
                      <LogOut className="w-4 h-4 text-red-600" />
                      <span>Déconnexion</span>
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="font-semibold text-slate-200 hover:text-white hover:bg-slate-800 rounded-md">
                      Connexion
                    </Button>
                  </Link>
                  <Link href="/boutique">
                    <Button variant="primary" size="sm" className="btn-purple flex items-center gap-1.5 font-extrabold rounded-md px-5">
                      <ShoppingBag className="w-4 h-4" />
                      <span>Les Produits</span>
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* MOBILE MENU TOGGLE BUTTON */}
            <div className="md:hidden flex items-center gap-2">
              {user && (
                <Link href="/compte">
                  <span className="px-3 py-1.5 text-xs font-extrabold bg-purple-600 text-white rounded-full flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    <span>Compte</span>
                    {unreadNotificationsCount > 0 && (
                      <span className="px-1.5 py-0.2 text-[10px] font-black bg-amber-400 text-amber-950 rounded-full">
                        {unreadNotificationsCount}
                      </span>
                    )}
                  </span>
                </Link>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-300 hover:bg-slate-800 rounded-xl"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6 text-purple-400" /> : <MenuIcon className="w-6 h-6 text-white" />}
              </button>
            </div>

          </div>
        </div>

        {/* MOBILE SCROLLABLE MENU DRAWER */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-[#090d16] px-4 pt-3 pb-8 space-y-3 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="space-y-1">
              {rootNavItems.map((item) => (
                <React.Fragment key={item.id}>
                  <Link
                    href={item.url}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl text-base font-bold text-slate-100 hover:bg-slate-800/80"
                  >
                    {item.title}
                  </Link>

                  {/* Render nested children in mobile drawer */}
                  {item.children && item.children.length > 0 && (
                    <div className="pl-6 space-y-1 border-l-2 border-purple-800/60 ml-4 my-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.id}
                          href={child.url}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-purple-950/30"
                        >
                          ↳ {child.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 flex flex-col gap-2.5">
              {user ? (
                <>
                  <Link href="/compte" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" className="w-full btn-purple font-extrabold flex items-center justify-center gap-2 py-3 rounded-xl">
                      <User className="w-4 h-4" />
                      <span>Mon Compte Client</span>
                      {unreadNotificationsCount > 0 && (
                        <span className="px-2 py-0.5 text-xs font-black bg-amber-400 text-amber-950 rounded-full">
                          {unreadNotificationsCount}
                        </span>
                      )}
                    </Button>
                  </Link>

                  {user.role === 'ADMIN' && (
                    <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="secondary" className="w-full font-bold bg-slate-800 text-white border-slate-700 py-3 rounded-xl">
                        <span>Administration CMS</span>
                      </Button>
                    </Link>
                  )}

                  <form action="/api/auth/logout" method="POST">
                    <Button type="submit" variant="outline" className="w-full text-red-400 border-slate-800 py-3 rounded-xl">
                      <LogOut className="w-4 h-4 mr-2" />
                      <span>Se déconnecter</span>
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full text-slate-200 border-slate-700 py-3 rounded-xl font-bold">
                      Connexion
                    </Button>
                  </Link>
                  <Link href="/boutique" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" className="w-full btn-purple py-3 rounded-xl font-extrabold">
                      Accéder à la Boutique
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
