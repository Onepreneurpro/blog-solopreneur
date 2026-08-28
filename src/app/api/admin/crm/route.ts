import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const DEMO_CUSTOMERS = [
  { name: 'Sophie Martin', email: 'sophie.martin@studio.fr', role: 'CUSTOMER', storeCredit: 0, isBlocked: false },
  { name: 'Thomas Dubois', email: 'thomas.dubois@freelance.io', role: 'CUSTOMER', storeCredit: 25, isBlocked: false },
  { name: 'Élodie Bernard', email: 'elodie.bernard@consulting.fr', role: 'CUSTOMER', storeCredit: 50, isBlocked: false },
  { name: 'Marc Lefevre', email: 'marc.lefevre@agence.com', role: 'CUSTOMER', storeCredit: 0, isBlocked: true },
  { name: 'Camille Petit', email: 'camille.petit@design.co', role: 'CUSTOMER', storeCredit: 15, isBlocked: false },
];

export async function GET() {
  try {
    const adminUser = await getCurrentUser();
    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
    }

    // 1. Fetch registered customer users
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        orders: {
          select: { id: true, totalAmount: true, status: true, createdAt: true, orderNumber: true },
        },
      },
    });

    // 2. Fetch all orders
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
      },
    });

    // 3. Fetch all direct messages & replies to count unread customer responses for admin per customer
    const directMessages = await prisma.directMessage.findMany({
      include: {
        replies: true,
      },
    });

    // Group orders & unread messages by email
    const customersMap = new Map<string, any>();

    // Seed map with registered users
    users.forEach((u) => {
      const emailKey = u.email.toLowerCase();
      const userOrders = orders.filter((o) => o.customerEmail.toLowerCase() === emailKey);
      const totalSpent = userOrders.reduce((sum, o) => sum + o.totalAmount, 0);

      const customerMsgs = directMessages.filter((m) => m.customerEmail.toLowerCase() === emailKey);
      // ONLY COUNT MESSAGES WITH UNREAD CUSTOMER REPLIES
      const unreadCount = customerMsgs.filter(
        (m) => !m.isRead && m.replies && m.replies.some((r) => r.sender === 'CUSTOMER')
      ).length;

      customersMap.set(emailKey, {
        id: u.id,
        name: u.name || 'Client Enregistré',
        email: u.email,
        role: u.role,
        isBlocked: u.isBlocked || false,
        storeCredit: u.storeCredit || 0,
        ordersCount: userOrders.length,
        totalSpent,
        unreadMessagesCount: unreadCount,
        createdAt: u.createdAt,
        orders: userOrders,
        isRegistered: true,
      });
    });

    // Add guest order buyers into map
    orders.forEach((o) => {
      const emailKey = o.customerEmail.toLowerCase();
      if (!customersMap.has(emailKey)) {
        const guestOrders = orders.filter((x) => x.customerEmail.toLowerCase() === emailKey);
        const totalSpent = guestOrders.reduce((sum, x) => sum + x.totalAmount, 0);

        const customerMsgs = directMessages.filter((m) => m.customerEmail.toLowerCase() === emailKey);
        const unreadCount = customerMsgs.filter(
          (m) => !m.isRead && m.replies && m.replies.some((r) => r.sender === 'CUSTOMER')
        ).length;

        customersMap.set(emailKey, {
          id: `guest-${emailKey}`,
          name: 'Acheteur Invité',
          email: o.customerEmail,
          role: 'CUSTOMER',
          isBlocked: false,
          storeCredit: 0,
          ordersCount: guestOrders.length,
          totalSpent,
          unreadMessagesCount: unreadCount,
          createdAt: o.createdAt,
          orders: guestOrders,
          isRegistered: false,
        });
      }
    });

    const customers = Array.from(customersMap.values());

    return NextResponse.json({ customers });
  } catch (error) {
    console.error('CRM GET error:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des clients.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const adminUser = await getCurrentUser();
    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
    }

    const body = await request.json();
    const { action, email, amount, name, newEmail, role, isBlocked, customersList, orderId, messageId } = body;

    // 1. ACTION: SEED DEMO CUSTOMERS
    if (action === 'SEED_DEMO') {
      for (const demoCust of DEMO_CUSTOMERS) {
        await prisma.user.upsert({
          where: { email: demoCust.email },
          update: {
            name: demoCust.name,
            role: demoCust.role,
            storeCredit: demoCust.storeCredit,
            isBlocked: demoCust.isBlocked,
          },
          create: {
            email: demoCust.email,
            passwordHash: 'DEMO_PASSWORD_HASH',
            name: demoCust.name,
            role: demoCust.role,
            storeCredit: demoCust.storeCredit,
            isBlocked: demoCust.isBlocked,
          },
        });
      }
      return NextResponse.json({ success: true, message: '5 clients démo ajoutés avec succès !' });
    }

    // 2. ACTION: CREATE SINGLE MANUAL CUSTOMER
    if (action === 'CREATE_CUSTOMER') {
      if (!email || !name) {
        return NextResponse.json({ error: 'Nom et adresse e-mail requis.' }, { status: 400 });
      }

      const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (existing) {
        return NextResponse.json({ error: 'Un client existe déjà avec cet e-mail.' }, { status: 400 });
      }

      const newUser = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash: 'MANUAL_CLIENT_HASH',
          name,
          role: role || 'CUSTOMER',
          storeCredit: Number(amount) || 0,
          isBlocked: Boolean(isBlocked),
        },
      });

      return NextResponse.json({ success: true, user: newUser });
    }

    // 3. ACTION: BATCH IMPORT CUSTOMERS (FROM CSV/EXCEL)
    if (action === 'IMPORT_CUSTOMERS' && Array.isArray(customersList)) {
      let count = 0;
      for (const item of customersList) {
        if (item.email && item.name) {
          await prisma.user.upsert({
            where: { email: item.email.toLowerCase() },
            update: {
              name: item.name,
              role: item.role || 'CUSTOMER',
              storeCredit: Number(item.storeCredit) || 0,
            },
            create: {
              email: item.email.toLowerCase(),
              passwordHash: 'IMPORTED_CLIENT',
              name: item.name,
              role: item.role || 'CUSTOMER',
              storeCredit: Number(item.storeCredit) || 0,
            },
          });
          count++;
        }
      }
      return NextResponse.json({ success: true, importedCount: count });
    }

    // 4. ACTION: UPDATE EXISTING CUSTOMER
    if (action === 'UPDATE_CUSTOMER') {
      let user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: email.toLowerCase(),
            passwordHash: 'GUEST_ACCOUNT',
            name: name || 'Client',
            role: role || 'CUSTOMER',
          },
        });
      }

      const targetEmail = newEmail ? newEmail.toLowerCase() : user.email;

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: name ?? user.name,
          email: targetEmail,
          role: role || user.role,
          storeCredit: amount !== undefined ? Number(amount) : user.storeCredit,
          isBlocked: isBlocked !== undefined ? Boolean(isBlocked) : user.isBlocked,
        },
      });

      if (newEmail && newEmail.toLowerCase() !== user.email.toLowerCase()) {
        await prisma.order.updateMany({
          where: { customerEmail: user.email },
          data: { customerEmail: targetEmail },
        });
      }

      return NextResponse.json({ success: true, user: updatedUser });
    }

    // 5. ACTION: TOGGLE BLOCK
    if (action === 'TOGGLE_BLOCK') {
      let user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: email.toLowerCase(),
            passwordHash: 'GUEST_ACCOUNT',
            name: 'Client',
            role: 'CUSTOMER',
          },
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { isBlocked: !user.isBlocked },
      });

      return NextResponse.json({ success: true, user: updatedUser });
    }

    // 6. ACTION: ADD CREDIT
    if (action === 'ADD_CREDIT') {
      let user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: email.toLowerCase(),
            passwordHash: 'GUEST_ACCOUNT',
            name: 'Client',
            role: 'CUSTOMER',
          },
        });
      }

      const addAmount = Number(amount) || 0;
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { storeCredit: { increment: addAmount } },
      });

      return NextResponse.json({ success: true, user: updatedUser });
    }

    // 7. ACTION: DELETE ORDER
    if (action === 'DELETE_ORDER') {
      if (!orderId) {
        return NextResponse.json({ error: 'ID de commande requis.' }, { status: 400 });
      }

      await prisma.orderItem.deleteMany({
        where: { orderId },
      });

      await prisma.order.delete({
        where: { id: orderId },
      });

      return NextResponse.json({ success: true, message: 'Commande supprimée avec succès.' });
    }

    // 8. ACTION: MARK SINGLE DIRECT MESSAGE AS READ
    if (action === 'MARK_READ') {
      if (!messageId) {
        return NextResponse.json({ error: 'ID de message requis.' }, { status: 400 });
      }

      await prisma.directMessage.update({
        where: { id: messageId },
        data: { isRead: true },
      });

      return NextResponse.json({ success: true, message: 'Message marqué comme lu.' });
    }

    // 9. ACTION: MARK ALL CUSTOMER MESSAGES AS READ
    if (action === 'MARK_ALL_READ') {
      if (!email) {
        return NextResponse.json({ error: 'Adresse e-mail client requise.' }, { status: 400 });
      }

      await prisma.directMessage.updateMany({
        where: { customerEmail: email.toLowerCase(), isRead: false },
        data: { isRead: true },
      });

      return NextResponse.json({ success: true, message: 'Tous les messages ont été marqués comme lus.' });
    }

    // 10. ACTION: MARK SINGLE DIRECT MESSAGE AS UNREAD
    if (action === 'MARK_UNREAD') {
      if (!messageId) {
        return NextResponse.json({ error: 'ID de message requis.' }, { status: 400 });
      }

      await prisma.directMessage.update({
        where: { id: messageId },
        data: { isRead: false },
      });

      return NextResponse.json({ success: true, message: 'Message remis en non-lu.' });
    }

    return NextResponse.json({ error: 'Action non reconnue.' }, { status: 400 });
  } catch (error: any) {
    console.error('CRM POST error:', error);
    return NextResponse.json({ error: error.message || 'Erreur lors de l opération.' }, { status: 500 });
  }
}
