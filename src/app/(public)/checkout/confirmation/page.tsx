import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, Download, ExternalLink, Mail, ArrowLeft, ShoppingBag } from 'lucide-react';
import { prisma } from '@/lib/prisma';
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
    <div className="py-16 bg-[#050811] text-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-[#0b0f19] p-8 sm:p-12 rounded-md border border-slate-800 shadow-2xl text-center space-y-6">
          
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <Badge variant="emerald" className="mb-2 bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold">
              Paiement Validé & Commande Confirmée
            </Badge>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Merci pour votre commande !
            </h1>
            <p className="text-slate-400 mt-2 text-base">
              Commande N° <strong className="text-purple-400">{order.orderNumber}</strong>. Votre ressource est immédiatement disponible.
            </p>
          </div>

          {/* ITEM CARD */}
          {item && (
            <div className="p-6 bg-[#131929] rounded-md border border-slate-700 text-left space-y-4 max-w-lg mx-auto shadow-inner">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-white">{itemTitle}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">Accès immédiat & sécurisé</div>
                </div>
                <div className="text-lg font-black text-purple-400">
                  {order.totalAmount === 0 ? 'Gratuit' : `${order.totalAmount} €`}
                </div>
              </div>

              {/* SECURE ACCESS BUTTON */}
              <div className="pt-3 border-t border-slate-700/60">
                <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="primary" size="lg" className="w-full bg-purple-700 hover:bg-purple-800 text-white gap-2 font-extrabold shadow-lg py-3.5 rounded-md border-0">
                    {isExternalLink ? <ExternalLink className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                    <span>{isExternalLink ? 'Ouvrir le Workspace Notion' : 'Télécharger mon fichier digital'}</span>
                  </Button>
                </a>
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-purple-400" />
              <span>Confirmation et lien envoyés à : <strong className="text-slate-200">{order.customerEmail}</strong></span>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-center gap-4">
            <Link href="/compte">
              <Button variant="outline" size="md" className="gap-1.5 font-bold border-slate-700 text-slate-300 hover:bg-slate-800 rounded-md">
                <ShoppingBag className="w-4 h-4 text-purple-400" />
                <span>Voir mon espace client & mes achats</span>
              </Button>
            </Link>
            <Link href="/boutique">
              <Button variant="ghost" size="md" className="gap-1.5 font-bold text-slate-400 hover:text-white rounded-md">
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
