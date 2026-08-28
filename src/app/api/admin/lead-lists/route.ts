import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const DEFAULT_LEAD_LISTS = [
  { name: 'Opt-in eBook Gratuit', slug: 'ebook-optin', description: 'Prospects ayant souscrit via le bloc eBook de la page d accueil', color: '#a3e635', sourceType: 'EBOOK_OPTIN' },
  { name: 'Ressources Gratuites', slug: 'free-resource', description: 'Prospects ayant téléchargé une fiche ou un guide gratuit', color: '#38bdf8', sourceType: 'FREE_RESOURCE' },
  { name: 'Clients de la Boutique', slug: 'customers', description: 'Clients ayant acheté un produit numérique payant', color: '#a855f7', sourceType: 'CUSTOMERS' },
  { name: 'Newsletter Général', slug: 'newsletter', description: 'Abonnés à la newsletter mensuelle', color: '#c084fc', sourceType: 'NEWSLETTER' },
];

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Ensure default lists exist
    for (const d of DEFAULT_LEAD_LISTS) {
      await prisma.leadList.upsert({
        where: { slug: d.slug },
        update: {},
        create: d,
      });
    }

    const lists = await prisma.leadList.findMany({
      include: {
        _count: {
          select: { leads: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ lists });
  } catch (error) {
    console.error('Error fetching lead lists:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des listes' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, color, sourceType } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'Le nom de la liste est obligatoire' }, { status: 400 });
    }

    const cleanName = name.trim();
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const cleanSourceType = sourceType || 'ALL';

    const newList = await prisma.leadList.create({
      data: {
        name: cleanName,
        slug: slug || `list-${Date.now()}`,
        description: description ? description.trim() : null,
        color: color || '#a3e635',
        sourceType: cleanSourceType,
      },
    });

    // Populate list automatically if sourceType is specific
    if (cleanSourceType === 'CUSTOMERS') {
      // Fetch store buyers from Order
      const orders = await prisma.order.findMany({
        where: { status: 'COMPLETED' },
        select: { customerEmail: true, user: { select: { name: true } } },
      });

      const uniqueBuyersMap = new Map<string, string | null>();
      for (const ord of orders) {
        if (ord.customerEmail && ord.customerEmail.includes('@')) {
          uniqueBuyersMap.set(ord.customerEmail.toLowerCase(), ord.user?.name || null);
        }
      }

      for (const [buyerEmail, buyerName] of uniqueBuyersMap.entries()) {
        await prisma.lead.upsert({
          where: { email: buyerEmail },
          update: {
            listId: newList.id,
            source: 'CUSTOMER',
            updatedAt: new Date(),
          },
          create: {
            email: buyerEmail,
            firstName: buyerName,
            source: 'CUSTOMER',
            listId: newList.id,
          },
        });
      }
    } else if (cleanSourceType === 'EBOOK_OPTIN' || cleanSourceType === 'FREE_RESOURCE' || cleanSourceType === 'NEWSLETTER') {
      // Associate unassigned leads of matching source
      await prisma.lead.updateMany({
        where: {
          source: cleanSourceType,
          listId: null,
        },
        data: {
          listId: newList.id,
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true, list: newList });
  } catch (error) {
    console.error('Error creating lead list:', error);
    return NextResponse.json({ error: 'Erreur lors de la création de la liste' }, { status: 500 });
  }
}
