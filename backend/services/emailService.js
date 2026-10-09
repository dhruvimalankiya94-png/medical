const nodemailer = require('nodemailer');

/**
 * Outbound email.
 *
 * Two modes, chosen automatically:
 *
 *  1. Real SMTP  - used when SMTP_HOST, SMTP_USER and SMTP_PASS are set in the
 *     environment (for example a Gmail account with an App Password).
 *
 *  2. Capture inbox - when no SMTP credentials are configured the service opens
 *     a disposable Ethereal mailbox. The mail is genuinely delivered there and
 *     the send result carries a previewUrl that opens the rendered message in a
 *     browser. This keeps the reset flow demonstrable on a local machine without
 *     hard-coding anyone's mail password, and without the earlier shortcut of
 *     returning the raw reset token in the API response.
 *
 * The transport is created once and reused.
 */

let transporterPromise = null;
let activeMode = null;

const hasSmtpConfig = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const buildTransporter = async () => {
  if (hasSmtpConfig()) {
    activeMode = 'smtp';
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: String(process.env.SMTP_SECURE || '') === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }

  const testAccount = await nodemailer.createTestAccount();
  activeMode = 'ethereal';
  return nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
};

const getTransporter = () => {
  if (!transporterPromise) {
    transporterPromise = buildTransporter().catch((err) => {
      // Reset so a later request can retry instead of caching the failure.
      transporterPromise = null;
      throw err;
    });
  }
  return transporterPromise;
};

/**
 * @returns {Promise<{messageId: string, mode: string, previewUrl: string|null}>}
 */
const sendMail = async ({ to, subject, text, html }) => {
  const transporter = await getTransporter();

  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM || 'HealthPulse <no-reply@healthpulse.local>',
    to,
    subject,
    text,
    html,
  });

  return {
    messageId: info.messageId,
    mode: activeMode,
    previewUrl: activeMode === 'ethereal' ? nodemailer.getTestMessageUrl(info) || null : null,
  };
};

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Password reset mail. Returns the same shape as sendMail. */
const sendPasswordResetEmail = async ({ to, name, resetUrl, expiryMinutes }) => {
  const safeName = escapeHtml(name || 'there');
  const safeUrl = escapeHtml(resetUrl);

  const text = [
    `Hello ${name || 'there'},`,
    '',
    'We received a request to reset your HealthPulse password.',
    'Open the link below to choose a new password:',
    '',
    resetUrl,
    '',
    `This link expires in ${expiryMinutes} minutes and can only be used once.`,
    'If you did not request a password reset, you can safely ignore this email.',
    '',
    '-- HealthPulse, Smart Healthcare Analytics System',
  ].join('\n');

  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#f1f5f9;padding:32px">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
      <div style="background:#0f172a;padding:20px 28px">
        <h1 style="margin:0;color:#ffffff;font-size:18px;font-weight:700">HealthPulse</h1>
        <p style="margin:4px 0 0;color:#94a3b8;font-size:12px">Smart Healthcare Analytics System</p>
      </div>
      <div style="padding:28px">
        <p style="margin:0 0 16px;color:#0f172a;font-size:15px">Hello ${safeName},</p>
        <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.6">
          We received a request to reset your HealthPulse password. Click the button below to choose a new one.
        </p>
        <p style="margin:0 0 24px">
          <a href="${safeUrl}" style="display:inline-block;background:#10b981;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:10px;font-size:14px;font-weight:600">
            Reset my password
          </a>
        </p>
        <p style="margin:0 0 8px;color:#64748b;font-size:12px">
          This link expires in <strong>${expiryMinutes} minutes</strong> and can only be used once.
        </p>
        <p style="margin:0 0 20px;color:#64748b;font-size:12px">
          If you did not request a password reset, you can safely ignore this email.
        </p>
        <p style="margin:0;color:#94a3b8;font-size:11px;word-break:break-all">
          Button not working? Paste this address into your browser:<br>${safeUrl}
        </p>
      </div>
    </div>
  </div>`;

  return sendMail({ to, subject: 'Reset your HealthPulse password', text, html });
};

module.exports = { sendMail, sendPasswordResetEmail, hasSmtpConfig };
