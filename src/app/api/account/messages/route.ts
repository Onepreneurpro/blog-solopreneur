import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
    }

    const messages = await prisma.directMessage.findMany({
      where: { customerEmail: user.email.toLowerCase() },
      orderBy: { createdAt: 'desc' },
      include: {
        replies: { orderBy: { createdAt: 'asc' } },
      },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Account DirectMessages GET error:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des messages.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
    }

    const { directMessageId, replyMessage, action, messageId } = await request.json();

    // 1. CUSTOMER MARKS SINGLE MESSAGE AS READ (INDEPENDENT FROM ADMIN)
    if (action === 'MARK_CUSTOMER_READ') {
      const targetId = messageId || directMessageId;
      if (!targetId) {
        return NextResponse.json({ error: 'ID de message requis.' }, { status: 400 });
      }

      await prisma.directMessage.update({
        where: { id: targetId },
        data: { customerIsRead: true },
      });

      return NextResponse.json({ success: true, message: 'Message marqué comme lu pour le client.' });
    }

    // 2. CUSTOMER SENDS A REPLY TO ADMIN
    if (!directMessageId || !replyMessage) {
      return NextResponse.json({ error: 'ID de message et texte de réponse requis.' }, { status: 400 });
    }

    const messageRecord = await prisma.directMessage.findUnique({
      where: { id: directMessageId },
    });

    if (!messageRecord || messageRecord.customerEmail.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ error: 'Message privé introuvable.' }, { status: 404 });
    }

    // Create customer reply
    const reply = await prisma.directMessageReply.create({
      data: {
        directMessageId,
        sender: 'CUSTOMER',
        message: replyMessage,
      },
    });

    // Update parent DirectMessage:
    // - isRead = false (ADMIN must be notified of unread reply)
    // - customerIsRead = true (CUSTOMER authored it, so customer has read it)
    await prisma.directMessage.update({
      where: { id: directMessageId },
      data: {
        isRead: false,
        customerIsRead: true,
      },
    });

    return NextResponse.json({ success: true, reply });
  } catch (error: any) {
    console.error('Customer DirectMessage POST error:', error);
    return NextResponse.json({ error: error.message || 'Erreur lors de l opération.' }, { status: 500 });
  }
}

// MARK ALL MESSAGES AS READ FOR CURRENT CUSTOMER ONLY (INDEPENDENT FROM ADMIN)
export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
    }

    let messageId: string | null = null;
    try {
      const body = await request.json();
      messageId = body.messageId || null;
    } catch (e) {
      // Body empty when calling PATCH without payload
    }

    if (messageId) {
      await prisma.directMessage.update({
        where: { id: messageId },
        data: { customerIsRead: true },
      });
    } else {
      await prisma.directMessage.updateMany({
        where: { customerEmail: user.email.toLowerCase(), customerIsRead: false },
        data: { customerIsRead: true },
      });
    }

    return NextResponse.json({ success: true, message: 'Messages marqués comme lus pour le client.' });
  } catch (error: any) {
    console.error('Mark messages read error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
