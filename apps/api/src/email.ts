import { config } from "./config.js";

type AuthEmail = {
  to: string;
  subject: string;
  heading: string;
  message: string;
  action: string;
  url: string;
};

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character]!,
  );
}

export async function sendAuthEmail(email: AuthEmail) {
  if (!config.resendApiKey || !config.authEmailFrom)
    throw new Error("Transactional email is not configured");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${config.resendApiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: config.authEmailFrom,
      to: [email.to],
      subject: email.subject,
      text: `${email.heading}\n\n${email.message}\n\n${email.action}: ${email.url}`,
      html: `<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:auto;color:#121612"><h1>${escapeHtml(email.heading)}</h1><p>${escapeHtml(email.message)}</p><p><a href="${escapeHtml(email.url)}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#ffc83d;color:#211700;font-weight:700;text-decoration:none">${escapeHtml(email.action)}</a></p><p style="color:#59625c;font-size:13px">If you did not request this, you can safely ignore this email.</p></div>`,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Resend rejected the email (${response.status}): ${detail}`,
    );
  }
}

export function dispatchAuthEmail(email: AuthEmail) {
  void sendAuthEmail(email).catch((error) => {
    console.error("Failed to send authentication email", error);
  });
}
