import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, Download, ExternalLink, Mail, ArrowLeft } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

interface ConfirmationPageProps {
  searchParams: { orderId?: string; token?: string };
}

export default async function ConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const { orderId, token } = searchParams;

  if (!orderId) {
    notFound();
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: true } },
      downloads: true,
    },
  });

  if (!order) {
    notFound();
  }

  const downloadRecord = order.downloads[0];
  const product = order.items[0]?.product;
  const isExternalLink = product?.fileUrl?.startsWith('http://') || product?.fileUrl?.startsWith('https://');
  const downloadUrl = downloadRecord ? `/api/download/${downloadRecord.downloadToken}` : '#';

  return (
    <div className="py-16 bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-md text-center space-y-6">
          
          <div className="w-16 h-16 bg-emerald-100 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <Badge variant="emerald" className="mb-2">Paiement Validé & Commande Confirmée</Badge>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Merci pour votre commande !
            </h1>
            <p className="text-slate-600 mt-2 text-base">
              Commande N° <strong className="text-slate-900">{order.orderNumber}</strong>. Votre ressource est prête.
            </p>
          </div>

          {/* ITEM CARD */}
          {order.items.length > 0 && (
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-4 max-w-lg mx-auto shadow-inner">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{order.items[0].title}</h3>
                  <div className="text-xs text-slate-500 mt-0.5">Accès immédiat & sécurisé</div>
                </div>
                <div className="text-lg font-black text-purple-700">
                  {order.totalAmount === 0 ? 'Gratuit' : `${order.totalAmount} €`}
                </div>
              </div>

              {/* SECURE ACCESS BUTTON */}
              <div className="pt-3 border-t border-slate-200">
                <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="primary" size="lg" className="w-full btn-purple gap-2 font-extrabold shadow-lg py-3.5">
                    {isExternalLink ? <ExternalLink className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                    <span>{isExternalLink ? 'Ouvrir le Workspace Notion' : 'Télécharger mon fichier digital'}</span>
                  </Button>
                </a>
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-purple-600" />
              <span>Confirmation et lien envoyés à : <strong>{order.customerEmail}</strong></span>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-center gap-4">
            <Link href="/boutique">
              <Button variant="outline" size="md" className="gap-1.5 font-bold">
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
