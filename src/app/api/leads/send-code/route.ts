import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmailViaSmtp, SmtpServerConfig } from '@/lib/smtp';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, firstName } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Adresse email invalide' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const pFirstName = (firstName || '').trim() || 'Abonné';

    // Generate 4-digit code (e.g. 1000 - 9999)
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Delete any old verification codes for this email
    await prisma.verificationCode.deleteMany({
      where: { email: normalizedEmail },
    }).catch(() => {});

    // Save new code
    await prisma.verificationCode.create({
      data: {
        email: normalizedEmail,
        code,
        expiresAt,
      },
    });

    // Fetch default SMTP server
    const smtpServer = await prisma.smtpServer.findFirst({
      where: { isDefault: true },
    }) || await prisma.smtpServer.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!smtpServer) {
      return NextResponse.json({ error: 'Aucun serveur SMTP n est configuré dans l administration' }, { status: 500 });
    }

    const smtpConfig: SmtpServerConfig = {
      id: smtpServer.id,
      name: smtpServer.name,
      host: smtpServer.host,
      port: smtpServer.port,
      username: smtpServer.username,
      password: smtpServer.password,
      encryption: smtpServer.encryption,
      fromEmail: smtpServer.fromEmail,
      fromName: smtpServer.fromName,
    };

    const subject = `🔒 Code de vérification : ${code}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; text-align: center;">
        <div style="margin-bottom: 16px;">
          <span style="font-size: 32px;">🔒</span>
        </div>
        <h2 style="color: #0f172a; font-size: 20px; font-weight: 800; margin-bottom: 8px;">Vérification de votre adresse email</h2>
        <p style="color: #475569; font-size: 14px; margin-bottom: 24px;">
          Bonjour <strong>${pFirstName}</strong>, voici votre code de confirmation à 4 chiffres pour valider votre demande :
        </p>
        <div style="background-color: #f8fafc; border: 2px dashed #a3e635; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
          <span style="font-family: monospace; font-size: 36px; font-weight: 900; letter-spacing: 12px; color: #1e1b4b;">${code}</span>
        </div>
        <p style="color: #94a3b8; font-size: 12px;">
          Ce code est valable pendant 15 minutes. Si vous n êtes pas à l origine de cette demande, vous pouvez ignorer cet email.
        </p>
      </div>
    `;

    const sendResult = await sendEmailViaSmtp({
      config: smtpConfig,
      to: normalizedEmail,
      subject,
      html,
    });

    if (!sendResult.success) {
      console.error('[Send Verification Code] Erreur SMTP:', sendResult.error);
      return NextResponse.json({ error: `Échec d envoi du code par email : ${sendResult.error}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Code de vérification envoyé' });
  } catch (error: any) {
    console.error('Error sending verification code:', error);
    return NextResponse.json({ error: error?.message || 'Erreur lors de l envoi du code' }, { status: 500 });
  }
}
