import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const adminUser = await getCurrentUser();
    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
    }

    const { email, subject, message, promoCode, directMessageId, replyMessage } = await request.json();

    // 1. ACTION: ADMIN REPLY DIRECTLY TO AN EXISTING THREAD
    if (directMessageId && replyMessage) {
      const parentMsg = await prisma.directMessage.findUnique({
        where: { id: directMessageId },
      });

      if (!parentMsg) {
        return NextResponse.json({ error: 'Discussion introuvable.' }, { status: 404 });
      }

      const reply = await prisma.directMessageReply.create({
        data: {
          directMessageId,
          sender: 'ADMIN',
          message: replyMessage,
        },
      });

      // Update parent DirectMessage:
      // - isRead = true (Admin authored this reply, so Admin has read it)
      // - customerIsRead = false (Customer must receive an unread notification)
      await prisma.directMessage.update({
        where: { id: directMessageId },
        data: {
          isRead: true,
          customerIsRead: false,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Réponse envoyée au client avec succès.',
        reply,
      });
    }

    // 2. ACTION: CREATE A NEW DIRECT MESSAGE / PROMO / RELANCE THREAD
    if (!email || !subject || !message) {
      return NextResponse.json({ error: 'E-mail, sujet et message requis.' }, { status: 400 });
    }

    // Find customer by email
    const customer = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    // Create a dedicated DirectMessage entry:
    // - isRead = true (Admin authored it)
    // - customerIsRead = false (Unread for Customer)
    const directMessage = await prisma.directMessage.create({
      data: {
        subject,
        content: message,
        promoCode: promoCode || null,
        customerEmail: email.toLowerCase(),
        customerId: customer?.id || null,
        isRead: true,
        customerIsRead: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Message privé / marketing envoyé avec succès à ${email}.`,
      directMessage,
    });
  } catch (error: any) {
    console.error('Contact customer error:', error);
    return NextResponse.json({ error: error.message || 'Erreur lors de l envoi.' }, { status: 500 });
  }
}
