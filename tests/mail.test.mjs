import assert from "node:assert/strict";
import test from "node:test";
import { createMailer } from "../src/lib/mail.ts";

test("Brevo SMTP uses authenticated STARTTLS and sends the configured sender", async () => {
  let config;
  let delivered;
  const mail = createMailer(
    {
      BREVO_SMTP_LOGIN: "login@smtp-brevo.com",
      BREVO_SMTP_KEY: "test-only-key",
      MAIL_FROM: "Bikes <sender@example.com>",
    },
    {
      createTransport(options) {
        config = options;
        return {
          async sendMail(message) {
            delivered = message;
          },
        };
      },
    },
  );
  assert.equal(mail.configured, true);
  await mail.send({
    to: "rider@example.com",
    subject: "Verify",
    text: "A <private> confirmation link.",
  });
  assert.equal(config.host, "smtp-relay.brevo.com");
  assert.equal(config.port, 587);
  assert.equal(config.requireTLS, true);
  assert.equal(config.auth.user, "login@smtp-brevo.com");
  assert.equal(delivered.from, "Bikes <sender@example.com>");
  assert.equal(delivered.to, "rider@example.com");
  assert.match(delivered.html, /&lt;private&gt;/);
});

test("a partial SMTP configuration does not pretend mail is available", () => {
  assert.equal(
    createMailer({ BREVO_SMTP_KEY: "test", MAIL_FROM: "sender@example.com" })
      .configured,
    false,
  );
});
