import type { Metadata } from 'next';
import { Poppins, Archivo_Black, Bebas_Neue } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getCurrentUser } from '@/lib/auth';
import { getActiveTheme } from '@/lib/theme';
import { prisma } from '@/lib/prisma';

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

const archivoBlack = Archivo_Black({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
});

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Solopreneur & Co — Plateforme de contenu & ressources digitales',
  description: 'Blog, templates Notion, dashboards Excel et ressources gratuites pour freelances, solopreneurs et coachs.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let user = null;
  let menuItems: any[] = [];
  let footerMenusMap: { [location: string]: { title: string; items: any[] } } = {};
  let activeTheme = 'drahmi-dark';

  try {
    const rawUser = await getCurrentUser();
    if (rawUser) {
      user = JSON.parse(JSON.stringify(rawUser));
    }
    activeTheme = await getActiveTheme();

    const allMenus = await prisma.menu.findMany({
      include: {
        items: {
          orderBy: { order: 'asc' },
        },
      },
    });

    const safeAllMenus = JSON.parse(JSON.stringify(allMenus));

    const headerMenu = safeAllMenus.find((m: any) => m.location === 'HEADER');
    if (headerMenu) {
      menuItems = headerMenu.items || [];
    }

    safeAllMenus.forEach((m: any) => {
      footerMenusMap[m.location] = { title: m.title, items: m.items || [] };
    });
  } catch (error) {
    // Database might not be migrated yet on initial cold boot
  }

  return (
    <html lang="fr" className={`h-full ${poppins.variable} ${archivoBlack.variable} ${bebasNeue.variable}`}>
      <body className={`flex flex-col min-h-full antialiased theme-${activeTheme} font-sans`}>
        <Header user={user} menuItems={menuItems} />
        <main className="flex-grow">{children}</main>
        <Footer footerMenus={footerMenusMap} />
      </body>
    </html>
  );
}
