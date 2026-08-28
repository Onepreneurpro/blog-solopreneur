import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    // 1. Fetch download record with associated product and order details
    const downloadRecord = await prisma.download.findUnique({
      where: { downloadToken: token },
      include: {
        product: true,
        order: true,
        user: true,
      },
    });

    if (!downloadRecord || !downloadRecord.product) {
      return new NextResponse(
        `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Lien invalide</title></head><body style="font-family:sans-serif;text-align:center;padding:50px;">
          <h1 style="color:#e11d48;">Lien de téléchargement invalide</h1>
          <p>Ce lien n'existe pas ou a expiré.</p>
        </body></html>`,
        { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    const { product, order } = downloadRecord;

    // 2. CHECK IF CLIENT ACCOUNT IS BLOCKED VIA CRM
    if (order) {
      const orderUser = await prisma.user.findUnique({ where: { email: order.customerEmail.toLowerCase() } });
      if (orderUser && orderUser.isBlocked) {
        return new NextResponse(
          `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Compte Bloqué</title></head><body style="font-family:sans-serif;text-align:center;padding:50px;background:#f8fafc;">
            <div style="max-width:500px;margin:0 auto;background:#ffffff;padding:40px;border-radius:16px;box-shadow:0 10px 25px rgba(0,0,0,0.05);border:1px solid #fee2e2;">
              <h1 style="color:#e11d48;font-size:22px;margin-bottom:10px;">🚫 Compte Suspende / Bloqué</h1>
              <p style="color:#475569;font-size:14px;line-height:1.6;">
                L'accès aux ressources pour l'adresse <strong>${order.customerEmail}</strong> a été temporairement suspendu par le support. Veuillez contacter l'administration.
              </p>
            </div>
          </body></html>`,
          { status: 403, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      }
    }

    // 3. STRICT AUTHENTICATION & PURCHASE OWNERSHIP CHECK FOR PAID PRODUCTS
    if (!product.isFreeResource) {
      const currentUser = await getCurrentUser();

      // Check if current logged in user is blocked
      if (currentUser && currentUser.isBlocked) {
        return new NextResponse(
          `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Compte Bloqué</title></head><body style="font-family:sans-serif;text-align:center;padding:50px;background:#f8fafc;">
            <div style="max-width:500px;margin:0 auto;background:#ffffff;padding:40px;border-radius:16px;box-shadow:0 10px 25px rgba(0,0,0,0.05);border:1px solid #fee2e2;">
              <h1 style="color:#e11d48;font-size:22px;margin-bottom:10px;">🚫 Votre Compte est Bloqué</h1>
              <p style="color:#475569;font-size:14px;line-height:1.6;">
                Votre compte client a été suspendu.
              </p>
            </div>
          </body></html>`,
          { status: 403, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      }

      // Order must be completed
      if (!order || order.status !== 'COMPLETED') {
        return new NextResponse(
          `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Paiement non confirmé</title></head><body style="font-family:sans-serif;text-align:center;padding:50px;">
            <h1 style="color:#e11d48;">Paiement non confirmé</h1>
            <p>Ce produit nécessite une commande validée et payée.</p>
          </body></html>`,
          { status: 403, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      }

      // REQUIREMENT: USER MUST BE LOGGED IN
      if (!currentUser) {
        return new NextResponse(
          `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Connexion requise</title></head><body style="font-family:sans-serif;text-align:center;padding:50px;background:#f8fafc;">
            <div style="max-width:500px;margin:0 auto;background:#ffffff;padding:40px;border-radius:16px;box-shadow:0 10px 25px rgba(0,0,0,0.05);border:1px solid #e2e8f0;">
              <h1 style="color:#0f172a;font-size:22px;margin-bottom:10px;">🔒 Connexion Obligatoire</h1>
              <p style="color:#475569;font-size:14px;line-height:1.6;">
                Vous êtes en <strong>navigation privée</strong> ou non connecté.<br/>
                Pour télécharger votre produit payant <strong>"${product.name}"</strong>, vous devez obligatoirement vous connecter avec le compte client associé (<strong>${order.customerEmail}</strong>).
              </p>
              <div style="margin-top:24px;">
                <a href="/login" style="display:inline-block;background:#7c3aed;color:#ffffff;padding:12px 24px;border-radius:99px;text-decoration:none;font-weight:bold;font-size:14px;">Se connecter à mon compte</a>
              </div>
            </div>
          </body></html>`,
          { status: 403, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      }

      // REQUIREMENT: LOGGED IN USER MUST BE THE OWNER OR ADMIN
      const isAdmin = currentUser.role === 'ADMIN';
      const isOwnerUser = (currentUser.id === downloadRecord.userId) || (order.customerId && currentUser.id === order.customerId);
      const isMatchingEmail = currentUser.email.toLowerCase() === order.customerEmail.toLowerCase();

      if (!isAdmin && !isOwnerUser && !isMatchingEmail) {
        return new NextResponse(
          `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Accès Refusé</title></head><body style="font-family:sans-serif;text-align:center;padding:50px;background:#f8fafc;">
            <div style="max-width:500px;margin:0 auto;background:#ffffff;padding:40px;border-radius:16px;box-shadow:0 10px 25px rgba(0,0,0,0.05);border:1px solid #e2e8f0;">
              <h1 style="color:#e11d48;font-size:22px;margin-bottom:10px;">⛔ Accès Refusé</h1>
              <p style="color:#475569;font-size:14px;line-height:1.6;">
                Le compte actuellement connecté (<strong>${currentUser.email}</strong>) n'a pas acheté ce produit digital (Acheté par : <strong>${order.customerEmail}</strong>).
              </p>
            </div>
          </body></html>`,
          { status: 403, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      }
    }

    // 4. CHECK MAX DOWNLOAD LIMIT
    if (downloadRecord.downloadCount >= downloadRecord.maxDownloads) {
      return new NextResponse(
        `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Limite atteinte</title></head><body style="font-family:sans-serif;text-align:center;padding:50px;">
          <h1 style="color:#e11d48;">Limite de téléchargement atteinte</h1>
          <p>Vous avez atteint le nombre maximum de téléchargements autorisés (${downloadRecord.maxDownloads}) pour ce lien.</p>
        </body></html>`,
        { status: 403, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    // 5. INCREMENT DOWNLOAD COUNTER
    await prisma.download.update({
      where: { id: downloadRecord.id },
      data: { downloadCount: { increment: 1 } },
    });

    const fileUrl = product.fileUrl;

    // OPTION 1: External URL (Notion workspace duplication link, Google Drive, Dropbox)
    if (fileUrl && (fileUrl.startsWith('http://') || fileUrl.startsWith('https://'))) {
      return NextResponse.redirect(fileUrl);
    }

    // OPTION 2: Local uploaded file path on server
    if (fileUrl) {
      const relativePath = fileUrl.startsWith('/') ? fileUrl.substring(1) : fileUrl;
      const absolutePath = path.join(process.cwd(), 'public', relativePath);

      if (fs.existsSync(absolutePath)) {
        const fileBuffer = fs.readFileSync(absolutePath);
        const fileName = path.basename(absolutePath);

        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${fileName}"`,
          },
        });
      }
    }

    // FALLBACK DEMO CONTENT STREAM
    const demoContent = `=== SOLOPRENEUR&CO - RESSOURCE DIGITALE ACCÈS SÉCURISÉ ===\n\nProduit : ${product.name}\nNuméro de commande : ${order?.orderNumber || 'GRATUIT'}\nEmail Client : ${order?.customerEmail || 'Non spécifié'}\nDate d'accès : ${new Date().toISOString()}\n\nMerci pour votre achat ! Ce fichier est votre copie d'accès officielle.`;
    
    return new NextResponse(demoContent, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${product.slug}-ressource.txt"`,
      },
    });
  } catch (error) {
    console.error('Download stream error:', error);
    return new NextResponse('Erreur lors du téléchargement.', { status: 500 });
  }
}
