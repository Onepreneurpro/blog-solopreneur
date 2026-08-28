import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Auto-fix existing leads where full name is stored in firstName and lastName is null/empty
    const leadsToFix = await prisma.lead.findMany({
      where: {
        firstName: { contains: ' ' },
        OR: [{ lastName: null }, { lastName: '' }],
      },
    });

    for (const l of leadsToFix) {
      if (l.firstName && l.firstName.includes(' ')) {
        const parts = l.firstName.trim().split(' ');
        const fName = parts[0];
        const lName = parts.slice(1).join(' ');
        await prisma.lead.update({
          where: { id: l.id },
          data: { firstName: fName, lastName: lName },
        });
      }
    }

    const rawLeads = await prisma.lead.findMany({
      include: {
        list: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Enrich each lead with sent email count, opened email count, and open rate metrics
    const leads = await Promise.all(
      rawLeads.map(async (lead) => {
        const sentCountInQueue = await prisma.emailSequenceQueue.count({
          where: {
            leadEmail: lead.email,
            status: 'SENT',
          },
        });

        const queueOpenedCount = await prisma.emailSequenceQueue.count({
          where: {
            leadEmail: lead.email,
            status: 'SENT',
            isOpened: true,
          },
        });

        const sentEmailsCount = sentCountInQueue;
        let openedEmailsCount = sentEmailsCount > 0 ? Math.min(Math.max(lead.openedEmailsCount || 0, queueOpenedCount), sentEmailsCount) : 0;
        const openRate = sentEmailsCount > 0 ? Math.round((openedEmailsCount / sentEmailsCount) * 100) : 0;

        return {
          ...lead,
          sentEmailsCount,
          openedEmailsCount,
          openRate,
        };
      })
    );

    return NextResponse.json({ leads });
  } catch (error) {
    console.error('Error fetching admin leads:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des leads' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await req.json();
    const { firstName, lastName, email, source, listId } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Email valide obligatoire' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    let cleanFirstName = firstName ? firstName.trim() : null;
    let cleanLastName = lastName ? lastName.trim() : null;

    if (cleanFirstName && cleanFirstName.includes(' ') && (!cleanLastName || cleanLastName === '')) {
      const parts = cleanFirstName.split(' ');
      cleanFirstName = parts[0];
      cleanLastName = parts.slice(1).join(' ');
    }

    const lead = await prisma.lead.create({
      data: {
        email: cleanEmail,
        firstName: cleanFirstName,
        lastName: cleanLastName,
        source: source || 'EBOOK_OPTIN',
        listId: listId || null,
      },
      include: { list: true },
    });

    return NextResponse.json({ success: true, lead });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json({ error: 'Erreur lors de la création du lead' }, { status: 500 });
  }
}
