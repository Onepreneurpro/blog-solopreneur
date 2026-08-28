import nodemailer from 'nodemailer';
import path from 'path';

export interface SmtpServerConfig {
  id?: string;
  name: string;
  host: string;
  port: number;
  username: string;
  password: string;
  encryption?: string; // TLS, SSL, NONE
  fromEmail: string;
  fromName: string;
}

export async function createSmtpTransporter(config: SmtpServerConfig) {
  const isSecure = config.port === 465 || config.encryption === 'SSL';

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: Number(config.port),
    secure: isSecure,
    auth: {
      user: config.username,
      pass: config.password,
    },
    tls: {
      rejectUnauthorized: false, // Prevents self-signed SSL errors in dev
    },
  });

  return transporter;
}

export async function testSmtpConnection(config: SmtpServerConfig) {
  try {
    const transporter = await createSmtpTransporter(config);
    await transporter.verify();
    return { success: true, message: 'Connexion SMTP réussie avec succès !' };
  } catch (error: any) {
    console.error('SMTP verification failed:', error);
    return {
      success: false,
      message: error?.message || 'Impossible de se connecter au serveur SMTP. Vérifiez les identifiants.',
    };
  }
}

export async function sendEmailViaSmtp({
  config,
  to,
  subject,
  html,
  text,
  attachments,
}: {
  config: SmtpServerConfig;
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{ filename: string; path?: string; content?: any }>;
}) {
  try {
    const transporter = await createSmtpTransporter(config);

    const info = await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>?/gm, ''),
      attachments,
    });

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Failed to send email via SMTP:', error);
    return { success: false, error: error?.message || 'Échec de l envoi de l email' };
  }
}
