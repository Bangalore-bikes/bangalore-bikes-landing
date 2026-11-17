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

export function createMailer(env: NodeJS.ProcessEnv = process.env): Mailer {
  const apiKey = env.RESEND_API_KEY?.trim();
  const from = env.MAIL_FROM?.trim();

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
        throw new Error(`Resend rejected the message with status ${response.status}`);
      }
    },
  };
}

export const mailer = createMailer();
