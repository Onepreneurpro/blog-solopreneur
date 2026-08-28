import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, Download, ExternalLink, Mail, ArrowLeft, ShoppingBag } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getActiveTheme, isDarkTheme } from '@/lib/theme';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

interface ConfirmationPageProps {
  searchParams: { orderId?: string; token?: string };
}

export default async function ConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const { orderId, token } = searchParams;

  if (!orderId && !token) {
    notFound();
  }

  const activeTheme = await getActiveTheme();
  const isDark = isDarkTheme(activeTheme);
  const isBluSky = activeTheme === 'blusky';

  const order = await prisma.order.findFirst({
    where: orderId ? { id: orderId } : { downloadToken: token },
    include: {
      items: { include: { product: true } },
      downloads: true,
    },
  });

  if (!order) {
    notFound();
  }

  const downloadRecord = order.downloads[0];
  const item = order.items[0];
  const product = item?.product;
  const itemTitle = product?.name || item?.title || 'Votre produit digital';
  const fileUrl = product?.fileUrl;
  const isExternalLink = fileUrl?.startsWith('http://') || fileUrl?.startsWith('https://');
  const downloadUrl = downloadRecord ? `/api/download/${downloadRecord.downloadToken}` : (fileUrl || '#');

  return (
    <div className={`py-16 min-h-screen ${
      isDark ? 'bg-[#050811] text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className={`p-8 sm:p-12 rounded-2xl border shadow-xl text-center space-y-6 ${
          isDark ? 'bg-[#0b0f19] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-lg border ${
            isDark
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : (isBluSky ? 'bg-[#e0f2fe] border-[#00A0FF]/40 text-[#00A0FF]' : 'bg-emerald-50 border-emerald-200 text-emerald-600')
          }`}>
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <Badge className={`mb-2 font-bold px-3.5 py-1 text-xs rounded-full border ${
              isDark
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : (isBluSky ? 'bg-[#e0f2fe] text-[#00A0FF] border-[#00A0FF]/40 font-black' : 'bg-emerald-50 text-emerald-700 border-emerald-200')
            }`}>
              Paiement Validé & Commande Confirmée
            </Badge>
            <h1 className={`text-3xl font-black tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Merci pour votre commande !
            </h1>
            <p className={`mt-2 text-base ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Commande N° <strong className={isDark ? 'text-purple-400' : (isBluSky ? 'text-[#00A0FF]' : 'text-purple-700')}>{order.orderNumber}</strong>. Votre ressource est immédiatement disponible.
            </p>
          </div>

          {/* ITEM CARD */}
          {item && (
            <div className={`p-6 rounded-xl border text-left space-y-4 max-w-lg mx-auto shadow-sm ${
              isDark
                ? 'bg-[#131929] border-slate-700 text-white'
                : (isBluSky ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-purple-50/50 border-purple-100 text-slate-900')
            }`}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className={`font-black text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>{itemTitle}</h3>
                  <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Accès immédiat & sécurisé</div>
                </div>
                <div className={`text-lg font-black shrink-0 ${
                  isDark ? 'text-purple-400' : (isBluSky ? 'text-[#00A0FF]' : 'text-purple-700')
                }`}>
                  {order.totalAmount === 0 ? 'Gratuit' : `${order.totalAmount} €`}
                </div>
              </div>

              {/* SECURE ACCESS BUTTON */}
              <div className={`pt-3 border-t ${isDark ? 'border-slate-700/60' : 'border-slate-200'}`}>
                <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="primary"
                    size="lg"
                    className={`w-full gap-2 font-black shadow-lg py-3.5 rounded-xl border-0 !text-white ${
                      isDark
                        ? 'bg-purple-700 hover:bg-purple-800'
                        : (isBluSky ? 'bg-[#00A0FF] hover:bg-[#0082D6]' : 'bg-purple-700 hover:bg-purple-800')
                    }`}
                  >
                    {isExternalLink ? <ExternalLink className="w-5 h-5 text-white" /> : <Download className="w-5 h-5 text-white" />}
                    <span className="text-white">{isExternalLink ? 'Ouvrir le Workspace Notion' : 'Télécharger mon fichier digital'}</span>
                  </Button>
                </a>
              </div>
            </div>
          )}

          <div className={`pt-6 border-t flex flex-col sm:flex-row items-center justify-center gap-4 text-xs ${
            isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'
          }`}>
            <div className="flex items-center gap-2">
              <Mail className={`w-4 h-4 ${isDark ? 'text-purple-400' : (isBluSky ? 'text-[#00A0FF]' : 'text-purple-600')}`} />
              <span>Confirmation et lien envoyés à : <strong className={isDark ? 'text-slate-200' : 'text-slate-900'}>{order.customerEmail}</strong></span>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-center gap-4">
            <Link href="/compte">
              <Button variant="outline" size="md" className={`gap-1.5 font-bold rounded-xl ${
                isDark
                  ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                  : (isBluSky ? 'border-slate-200 text-slate-700 hover:bg-slate-100' : 'border-slate-200 text-slate-700 hover:bg-purple-50')
              }`}>
                <ShoppingBag className={`w-4 h-4 ${isDark ? 'text-purple-400' : (isBluSky ? 'text-[#00A0FF]' : 'text-purple-600')}`} />
                <span>Voir mon espace client & mes achats</span>
              </Button>
            </Link>
            <Link href="/boutique">
              <Button variant="ghost" size="md" className={`gap-1.5 font-bold rounded-xl ${
                isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}>
                <ArrowLeft className="w-4 h-4" />
                <span>Retour à la boutique</span>
              </Button>
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
