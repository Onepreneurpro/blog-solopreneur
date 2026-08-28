import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { sendEmailViaSmtp, testSmtpConnection } from '@/lib/smtp';

export const dynamic = 'force-dynamic';

export async function POST(
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
    const testRecipient = body.recipient || currentUser.email;

    const serverConfig = await prisma.smtpServer.findUnique({
      where: { id },
    });

    if (!serverConfig) {
      return NextResponse.json({ error: 'Serveur SMTP introuvable' }, { status: 404 });
    }

    // First verify credentials connection
    const connResult = await testSmtpConnection(serverConfig);
    if (!connResult.success) {
      return NextResponse.json({ error: connResult.message }, { status: 400 });
    }

    // Send actual test email via Nodemailer
    const sendResult = await sendEmailViaSmtp({
      config: serverConfig,
      to: testRecipient,
      subject: `[TEST SMTP] Test de connexion - ${serverConfig.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
          <h2 style="color: #6d28d9; margin-top: 0;">⚡ Test SMTP Réussi !</h2>
          <p>Félicitations, votre serveur SMTP <strong>${serverConfig.name}</strong> (${serverConfig.host}:${serverConfig.port}) est correctement configuré et opérationnel.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 15px 0;" />
          <ul style="color: #334155; font-size: 13px; line-height: 1.6;">
            <li><strong>Expéditeur configuré :</strong> ${serverConfig.fromName} &lt;${serverConfig.fromEmail}&gt;</li>
            <li><strong>Serveur Hôte :</strong> ${serverConfig.host}</li>
            <li><strong>Port / Chiffrement :</strong> ${serverConfig.port} (${serverConfig.encryption})</li>
            <li><strong>Date du test :</strong> ${new Date().toLocaleString('fr-FR')}</li>
          </ul>
          <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">Solopreneur&Co CMS - Module Automation Mail</p>
        </div>
      `,
    });

    if (!sendResult.success) {
      return NextResponse.json({ error: sendResult.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Email de test envoyé avec succès à ${testRecipient} via ${serverConfig.name} !`,
    });
  } catch (error: any) {
    console.error('Error testing SMTP server:', error);
    return NextResponse.json({ error: error?.message || 'Échec du test SMTP' }, { status: 500 });
  }
}
