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

    const servers = await prisma.smtpServer.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ servers });
  } catch (error) {
    console.error('Error fetching SMTP servers:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des serveurs SMTP' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await req.json();
    const { name, host, port, username, password, encryption, fromEmail, fromName, isDefault } = body;

    if (!name || !host || !username || !password || !fromEmail || !fromName) {
      return NextResponse.json({ error: 'Tous les champs du serveur SMTP sont requis' }, { status: 400 });
    }

    if (isDefault) {
      // Unset previous defaults
      await prisma.smtpServer.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const newServer = await prisma.smtpServer.create({
      data: {
        name: name.trim(),
        host: host.trim(),
        port: parseInt(port) || 587,
        username: username.trim(),
        password: password,
        encryption: encryption || 'TLS',
        fromEmail: fromEmail.trim().toLowerCase(),
        fromName: fromName.trim(),
        isDefault: Boolean(isDefault),
      },
    });

    return NextResponse.json({ success: true, server: newServer });
  } catch (error) {
    console.error('Error creating SMTP server:', error);
    return NextResponse.json({ error: 'Erreur lors de la création du serveur SMTP' }, { status: 500 });
  }
}
