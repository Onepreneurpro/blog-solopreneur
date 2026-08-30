import type { Metadata } from 'next';
import { Poppins, Archivo_Black, Bebas_Neue } from 'next/font/google';
import './globals.css';
import { RootLayoutWrapper } from '@/components/layout/RootLayoutWrapper';
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Caveat:wght@400;700&family=Cinzel:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@400;500;700&family=Dancing+Script:wght@500;700&family=Inter:wght@400;600;800;900&family=Lora:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@400;700;900&family=Oswald:wght@400;600;700&family=Outfit:wght@400;700;900&family=Pacifico&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Plus+Jakarta+Sans:wght@400;700;800&family=Poppins:wght@400;600;800;900&family=Raleway:wght@400;700;900&family=Roboto:wght@400;700;900&family=Space+Grotesk:wght@500;700&family=Syne:wght@700;800&family=Unbounded:wght@700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`flex flex-col min-h-full antialiased theme-${activeTheme} font-sans`}>
        <RootLayoutWrapper user={user} menuItems={menuItems} footerMenusMap={footerMenusMap}>
          {children}
        </RootLayoutWrapper>
      </body>
    </html>
  );
}
