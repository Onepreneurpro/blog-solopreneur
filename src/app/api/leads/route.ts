import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { triggerCampaignSequencesForLead } from '@/lib/campaign-dispatcher';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, code, source, listId, welcomeStepId } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Adresse email valide requise' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // VERIFY 4-DIGIT OTP CODE
    if (!code || typeof code !== 'string' || code.trim().length !== 4) {
      return NextResponse.json({ error: 'Le code de vérification à 4 chiffres est obligatoire.' }, { status: 400 });
    }

    const validCode = await prisma.verificationCode.findFirst({
      where: {
        email: cleanEmail,
        code: code.trim(),
        expiresAt: { gte: new Date() },
      },
    });

    if (!validCode) {
      return NextResponse.json({ error: '❌ Code de vérification incorrect ou expiré. Veuillez vérifier votre boîte mail.' }, { status: 400 });
    }

    // Code is valid! Delete used verification code
    await prisma.verificationCode.deleteMany({
      where: { email: cleanEmail },
    }).catch(() => {});

    let cleanFirstName = firstName ? firstName.trim() : null;
    let cleanLastName = lastName ? lastName.trim() : null;

    // AUTOMATIC FULL-NAME SPLITTING IF firstName CONTAINS SPACE AND lastName IS EMPTY
    if (cleanFirstName && cleanFirstName.includes(' ') && (!cleanLastName || cleanLastName === '')) {
      const parts = cleanFirstName.split(' ');
      cleanFirstName = parts[0];
      cleanLastName = parts.slice(1).join(' ');
    }

    const leadSource = source || 'EBOOK_OPTIN';

    // Check if lead already exists
    const existingLead = await prisma.lead.findUnique({
      where: { email: cleanEmail },
    });

    // RULE: If lead is ALREADY a CUSTOMER, preserve their CUSTOMER status & list!
    if (existingLead && existingLead.source === 'CUSTOMER') {
      const updatedCustomerLead = await prisma.lead.update({
        where: { email: cleanEmail },
        data: {
          firstName: cleanFirstName || existingLead.firstName,
          lastName: cleanLastName || existingLead.lastName,
          updatedAt: new Date(),
        },
      });

      // Trigger any customer campaign sequences if listId exists
      if (updatedCustomerLead.listId) {
        triggerCampaignSequencesForLead({
          leadEmail: cleanEmail,
          leadFirstName: updatedCustomerLead.firstName,
          leadLastName: updatedCustomerLead.lastName,
          listId: updatedCustomerLead.listId,
          welcomeStepId,
        }).catch((err) => console.error('Background campaign error:', err));
      }

      return NextResponse.json({
        success: true,
        message: 'Client reconnu - Statut client préservé !',
        lead: updatedCustomerLead,
      });
    }

    // Determine target list ID: use passed listId if provided, otherwise find or create for source
    let targetListId: string | null = listId || null;

    if (!targetListId) {
      let matchingList = await prisma.leadList.findFirst({
        where: { sourceType: leadSource },
        orderBy: { createdAt: 'desc' },
      });

      if (!matchingList) {
        matchingList = await prisma.leadList.create({
          data: {
            name: leadSource === 'FREE_RESOURCE' ? 'Ressources Gratuites' : 'Opt-in eBook Gratuit',
            slug: (leadSource === 'FREE_RESOURCE' ? 'ressources-gratuites' : 'opt-in-ebook-gratuit') + '-' + Date.now(),
            description: 'Liste créée automatiquement pour capturer les prospects de ce segment.',
            color: leadSource === 'FREE_RESOURCE' ? '#60a5fa' : '#a3e635',
            sourceType: leadSource,
          },
        });
      }
      targetListId = matchingList.id;
    }

    // Create or update lead with target listId assignment
    const lead = await prisma.lead.upsert({
      where: { email: cleanEmail },
      update: {
        firstName: cleanFirstName || undefined,
        lastName: cleanLastName || undefined,
        source: leadSource,
        listId: targetListId,
        updatedAt: new Date(),
      },
      create: {
        email: cleanEmail,
        firstName: cleanFirstName,
        lastName: cleanLastName,
        source: leadSource,
        listId: targetListId,
      },
    });

    // TRIGGER CAMPAIGN SEQUENCES FOR THIS LEAD AUTOMATICALLY
    triggerCampaignSequencesForLead({
      leadEmail: cleanEmail,
      leadFirstName: lead.firstName,
      leadLastName: lead.lastName,
      listId: targetListId,
      welcomeStepId,
    }).catch((err) => console.error('[Lead API] Background campaign error:', err));

    return NextResponse.json({
      success: true,
      message: 'Inscription validée avec succès !',
      lead,
    });
  } catch (error: any) {
    console.error('Lead creation error:', error);
    return NextResponse.json({ error: error?.message || 'Erreur serveur lors de la création du lead' }, { status: 500 });
  }
}
