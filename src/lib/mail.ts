import nodemailer from "nodemailer";

export type MailMessage = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export type Mailer = {
  configured: boolean;
  send(message: MailMessage): Promise<void>;
};

function domainOf(address: string): string {
  const at = address.lastIndexOf("@");
  return at === -1 ? "unknown" : address.slice(at + 1);
}

/**
 * Logs only the recipient's domain. Auth mail is uninteresting to attackers but
 * a full address in a hosting log is still personal data the site did not need
 * to keep.
 */
function redact(address: string): string {
  return `***@${domainOf(address)}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Plain-text templates are the source of truth; the HTML part is generated so
 * the two can never disagree. No tracking pixels, no remote assets.
 */
function toHtml(message: MailMessage): string {
  const paragraphs = message.text
    .split(/\n{2,}/)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br />")}</p>`)
    .join("\n");
  return `<!doctype html><html><body style="font-family:system-ui,sans-serif;line-height:1.6;color:#1c1b19">${paragraphs}</body></html>`;
}

type SmtpOptions = {
  host: string;
  port: number;
  secure: boolean;
  requireTLS: boolean;
  auth: { user: string; pass: string };
  connectionTimeout: number;
  greetingTimeout: number;
  socketTimeout: number;
  disableFileAccess: boolean;
  disableUrlAccess: boolean;
};

export function createMailer(
  env: NodeJS.ProcessEnv = process.env,
  transport: {
    createTransport(options: SmtpOptions): {
      sendMail(message: {
        from: string;
        to: string;
        subject: string;
        text: string;
        html: string;
      }): Promise<unknown>;
    };
  } = nodemailer,
): Mailer {
  const apiKey = env.RESEND_API_KEY?.trim();
  const from = env.MAIL_FROM?.trim();
  const smtpLogin = env.BREVO_SMTP_LOGIN?.trim();
  const smtpKey = env.BREVO_SMTP_KEY?.trim();

  if (smtpLogin && smtpKey && from) {
    const smtp = transport.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: { user: smtpLogin, pass: smtpKey },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
      disableFileAccess: true,
      disableUrlAccess: true,
    });
    return {
      configured: true,
      async send(message) {
        try {
          await smtp.sendMail({
            from,
            to: message.to,
            subject: message.subject,
            text: message.text,
            html: message.html ?? toHtml(message),
          });
        } catch {
          // SMTP errors can echo recipient or credentials. Keep them private.
          throw new Error(
            "Email delivery failed. Check the Brevo sender and SMTP configuration.",
          );
        }
      },
    };
  }

  if (!apiKey || !from) {
    return {
      configured: false,
      async send(message) {
        console.info(
          `[mail] not configured; would send "${message.subject}" to ${redact(message.to)}`,
        );
      },
    };
  }

  return {
    configured: true,
    async send(message) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [message.to],
          subject: message.subject,
          text: message.text,
          html: message.html ?? toHtml(message),
        }),
        signal: AbortSignal.timeout(10_000),
      });

      if (!response.ok) {
        // The body may echo the recipient, so only the status is logged.
        throw new Error(
          `Resend rejected the message with status ${response.status}`,
        );
      }
    },
  };
}

export const mailer = createMailer();
