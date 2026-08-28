import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { name, host, port, username, password, encryption, fromEmail, fromName, isDefault } = body;

    if (isDefault) {
      await prisma.smtpServer.updateMany({
        where: { id: { not: id } },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.smtpServer.update({
      where: { id },
      data: {
        name: name ? name.trim() : undefined,
        host: host ? host.trim() : undefined,
        port: port ? parseInt(port) : undefined,
        username: username ? username.trim() : undefined,
        password: password !== undefined ? password : undefined,
        encryption: encryption || undefined,
        fromEmail: fromEmail ? fromEmail.trim().toLowerCase() : undefined,
        fromName: fromName ? fromName.trim() : undefined,
        isDefault: isDefault !== undefined ? Boolean(isDefault) : undefined,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, server: updated });
  } catch (error) {
    console.error('Error updating SMTP server:', error);
    return NextResponse.json({ error: 'Erreur lors de la modification du serveur SMTP' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = params;
    await prisma.smtpServer.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Serveur SMTP supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting SMTP server:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression du serveur SMTP' }, { status: 500 });
  }
}
