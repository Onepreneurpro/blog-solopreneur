import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, hashPassword, createSessionCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'E-mail et mot de passe requis.' }, { status: 400 });
    }

    const lowerEmail = email.toLowerCase().trim();

    let user = await prisma.user.findUnique({
      where: { email: lowerEmail },
    });

    // DEMO CUSTOMER AUTO CREATION/UPDATE FOR EASY TESTING
    if (!user && (lowerEmail === 'client@solopreneur.io' || lowerEmail === 'sophie.martin@studio.fr') && password === 'client123') {
      const passwordHash = await hashPassword('client123');
      user = await prisma.user.create({
        data: {
          email: lowerEmail,
          passwordHash,
          name: lowerEmail === 'client@solopreneur.io' ? 'Client Test' : 'Sophie Martin',
          role: 'CUSTOMER',
        },
      });
    }

    // DEMO ADMIN AUTO CREATION FOR EASY TESTING
    if (!user && lowerEmail === 'admin@solopreneur.io' && password === 'admin123') {
      const passwordHash = await hashPassword('admin123');
      user = await prisma.user.create({
        data: {
          email: lowerEmail,
          passwordHash,
          name: 'Administrateur Solopreneur',
          role: 'ADMIN',
        },
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'Identifiants incorrects.' }, { status: 401 });
    }

    // Check if user is blocked via CRM
    if (user.isBlocked) {
      return NextResponse.json(
        { error: 'Votre compte client a été suspendu par le support (CRM Bloqué).' },
        { status: 403 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Identifiants incorrects.' }, { status: 401 });
    }

    await createSessionCookie(user.id);

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Erreur d authentification.' }, { status: 500 });
  }
}
