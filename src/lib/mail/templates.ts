export type MailTemplate = { subject: string; text: string };

const GREETING = "Bangalore Bikes";

function footer(): string {
  return `\n\nIf you did not ask for this, ignore the message and nothing will change.\n\n— ${GREETING}`;
}

export function verificationMail(options: {
  displayName: string;
  url: string;
  hours: number;
}): MailTemplate {
  return {
    subject: "Confirm your Bangalore Bikes account",
    text: `Hi ${options.displayName},

Confirm the email address on your Bangalore Bikes account by opening this link:

${options.url}

The link works once and expires in ${options.hours} hours. Until you confirm, you can write drafts but cannot publish or comment.${footer()}`,
  };
}

export function passwordResetMail(options: {
  displayName: string;
  url: string;
  minutes: number;
}): MailTemplate {
  return {
    subject: "Reset your Bangalore Bikes password",
    text: `Hi ${options.displayName},

Use this link to choose a new password:

${options.url}

The link works once and expires in ${options.minutes} minutes. Choosing a new password signs you out everywhere else.${footer()}`,
  };
}

/**
 * Sent when a moderator decision changes a post's visibility, so authors are
 * not left refreshing their drafts page hoping for news.
 */
export function moderationMail(options: {
  displayName: string;
  title: string;
  outcome: "published" | "rejected" | "unpublished";
  note: string | null;
  url: string;
}): MailTemplate {
  const reason = options.note ? `\n\nModerator note: ${options.note}` : "";
  const summary = {
    published: "is now live",
    rejected: "was not approved in its current form",
    unpublished: "has been taken down while it is revised",
  }[options.outcome];
  return {
    subject: `Your post "${options.title}" ${options.outcome === "published" ? "is live" : "needs attention"}`,
    text: `Hi ${options.displayName},

Your post "${options.title}" ${summary}.${reason}

Read or edit it here: ${options.url}${footer()}`,
  };
}
