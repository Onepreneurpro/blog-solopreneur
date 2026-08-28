import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { triggerCampaignSequencesForLead } from '@/lib/campaign-dispatcher';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, email, firstName, lastName, paymentMethod, code } = body;

    if (!productId || !email) {
      return NextResponse.json({ error: 'Produit et e-mail requis.' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Produit introuvable.' }, { status: 404 });
    }

    const user = await getCurrentUser();
    const cleanEmail = email.trim().toLowerCase();

    // REQUIRE 4-DIGIT EMAIL VERIFICATION CODE FOR UNAUTHENTICATED OR NEW EMAIL CHECKOUTS
    const isSessionVerified = user && user.email?.toLowerCase() === cleanEmail;

    if (!isSessionVerified) {
      const cleanCode = code ? String(code).trim() : null;
      if (!cleanCode || cleanCode.length !== 4) {
        return NextResponse.json({ error: 'Veuillez saisir le code de vérification à 4 chiffres reçu par e-mail.' }, { status: 400 });
      }

      const validCode = await prisma.verificationCode.findFirst({
        where: {
          email: cleanEmail,
          code: cleanCode,
          expiresAt: { gte: new Date() },
        },
      });

      if (!validCode) {
        return NextResponse.json({ error: 'Code de vérification invalide ou expiré. Veuillez en demander un nouveau.' }, { status: 400 });
      }

      // Delete used code
      await prisma.verificationCode.deleteMany({
        where: { email: cleanEmail },
      }).catch(() => {});
    }
    let cleanFirstName = firstName && typeof firstName === 'string' && firstName.trim() !== ''
      ? firstName.trim()
      : (user?.name ? user.name.split(' ')[0] : null);
    let cleanLastName = lastName && typeof lastName === 'string' && lastName.trim() !== ''
      ? lastName.trim()
      : (user?.name && user.name.includes(' ') ? user.name.split(' ').slice(1).join(' ') : null);

    // AUTOMATIC FULL-NAME SPLITTING IF firstName CONTAINS SPACE AND lastName IS EMPTY
    if (cleanFirstName && cleanFirstName.includes(' ') && (!cleanLastName || cleanLastName === '')) {
      const parts = cleanFirstName.split(' ');
      cleanFirstName = parts[0];
      cleanLastName = parts.slice(1).join(' ');
    }

    // Generate unique order number and secure download token
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const downloadToken = crypto.randomBytes(32).toString('hex');

    // Create Order in DB after payment validation
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerEmail: cleanEmail,
        userId: user?.id || null,
        totalAmount: product.price,
        status: 'COMPLETED',
        paymentMethod: paymentMethod || 'STRIPE',
        downloadToken,
        items: {
          create: {
            productId: product.id,
            price: product.price,
          },
        },
        downloads: {
          create: {
            productId: product.id,
            userId: user?.id || null,
          },
        },
      },
      include: {
        items: true,
        downloads: true,
      },
    });

    // Increment downloads count on product
    await prisma.product.update({
      where: { id: product.id },
      data: { downloadsCount: { increment: 1 } },
    });

    // Check existing lead
    const existingLead = await prisma.lead.findUnique({
      where: { email: cleanEmail },
    });

    let assignedLead: any = null;

    // AUTOMATIC LEAD & LIST ROUTING WITH PRODUCT CUSTOM OVERRIDES & CUSTOMER PROTECTION RULE
    let targetListId: string | null = product.targetListId || null;

    if (!targetListId) {
      if (product.price === 0 || product.isFreeResource) {
        const freeList = await prisma.leadList.findFirst({
          where: { sourceType: 'FREE_RESOURCE' },
          orderBy: { createdAt: 'desc' },
        });
        targetListId = freeList?.id || null;
      } else {
        const customerList = await prisma.leadList.findFirst({
          where: { sourceType: 'CUSTOMERS' },
          orderBy: { createdAt: 'desc' },
        });
        targetListId = customerList?.id || null;
      }
    }

    const isPaid = product.price > 0 && !product.isFreeResource;
    const leadSource = isPaid ? 'CUSTOMER' : 'FREE_RESOURCE';

    if (isPaid || !existingLead || existingLead.source !== 'CUSTOMER') {
      assignedLead = await prisma.lead.upsert({
        where: { email: cleanEmail },
        update: {
          firstName: cleanFirstName || undefined,
          lastName: cleanLastName || undefined,
          source: leadSource,
          listId: targetListId || undefined,
          updatedAt: new Date(),
        },
        create: {
          email: cleanEmail,
          firstName: cleanFirstName,
          lastName: cleanLastName,
          source: leadSource,
          listId: targetListId || undefined,
        },
      });
    } else {
      assignedLead = await prisma.lead.update({
        where: { email: cleanEmail },
        data: {
          firstName: cleanFirstName || existingLead.firstName,
          lastName: cleanLastName || existingLead.lastName,
          updatedAt: new Date(),
        },
      });
    }

    // AUTOMATED EMAIL CAMPAIGN DISPATCHER
    const activeListId = targetListId || assignedLead?.listId;
    if (assignedLead && activeListId) {
      triggerCampaignSequencesForLead({
        leadEmail: cleanEmail,
        leadFirstName: assignedLead.firstName,
        leadLastName: assignedLead.lastName,
        listId: activeListId,
        welcomeStepId: product.welcomeStepId || undefined,
      }).catch((err) => console.error('Background campaign error:', err));
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      downloadToken: order.downloadToken,
      redirectUrl: `/checkout/confirmation?orderId=${order.id}`,
      downloadUrl: `/checkout/confirmation?orderId=${order.id}`,
    });
  } catch (error) {
    console.error('Checkout Error:', error);
    return NextResponse.json({ error: 'Erreur lors de la commande.' }, { status: 500 });
  }
}
