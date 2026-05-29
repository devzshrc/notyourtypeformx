// Plain-HTML email templates. Kept dependency-free and inline-styled (email clients
// strip <style>/external CSS). Dark, branded to match the Schema app.
//
// When template count/complexity grows, extract a shared `@repo/emails` package using
// React Email — for now these helpers are enough.

const BRAND = "#6d5efc"; // primary
const BG = "#0a0a0b";
const CARD = "#141416";
const TEXT = "#e7e7ea";
const MUTED = "#9b9ba3";
const BORDER = "#26262b";

function shell(opts: { heading: string; body: string; cta?: { label: string; url: string }; footer?: string }): string {
    const { heading, body, cta, footer } = opts;
    return `<!doctype html>
<html><body style="margin:0;padding:0;background:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:${CARD};border:1px solid ${BORDER};border-radius:16px;overflow:hidden;">
        <tr><td style="padding:32px 32px 0;">
          <div style="font-size:20px;font-weight:700;color:${BRAND};letter-spacing:-0.02em;">Schema</div>
        </td></tr>
        <tr><td style="padding:24px 32px 8px;">
          <h1 style="margin:0 0 12px;font-size:22px;line-height:1.25;color:${TEXT};letter-spacing:-0.02em;">${heading}</h1>
          <div style="font-size:15px;line-height:1.6;color:${MUTED};">${body}</div>
        </td></tr>
        ${cta ? `<tr><td style="padding:20px 32px 8px;">
          <a href="${cta.url}" style="display:inline-block;background:${BRAND};color:#fff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 24px;border-radius:10px;">${cta.label}</a>
        </td></tr>
        <tr><td style="padding:8px 32px 0;">
          <div style="font-size:12px;color:${MUTED};word-break:break-all;">Or paste this link: <a href="${cta.url}" style="color:${BRAND};">${cta.url}</a></div>
        </td></tr>` : ""}
        <tr><td style="padding:28px 32px 32px;">
          <div style="border-top:1px solid ${BORDER};padding-top:16px;font-size:12px;color:${MUTED};">${footer ?? "You're receiving this because of activity on your Schema account."}</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export function inviteEmail(p: { url: string; role: string; workspaceName: string; inviterName: string }): { subject: string; html: string } {
    return {
        subject: `${p.inviterName} invited you to ${p.workspaceName} on Schema`,
        html: shell({
            heading: `Join ${p.workspaceName}`,
            body: `<strong style="color:${TEXT};">${p.inviterName}</strong> invited you to collaborate on the <strong style="color:${TEXT};">${p.workspaceName}</strong> workspace as a <strong style="color:${TEXT};">${p.role.toLowerCase()}</strong>. This invite expires in 7 days.`,
            cta: { label: "Accept invitation", url: p.url },
            footer: "If you weren't expecting this invite, you can safely ignore this email.",
        }),
    };
}

export function welcomeEmail(p: { name: string; url: string }): { subject: string; html: string } {
    const first = p.name.split(" ")[0] || "there";
    return {
        subject: "You're in ✨ Welcome to Schema",
        html: shell({
            heading: `Hey ${first} 🎉`,
            body: `You just made my day (and my server logs) 🥹<br><br>Schema turns one sentence into a full form — questions, validation, logic, themes, the whole shebang. No drag-and-drop suffering required.<br><br>Go ahead, describe something wild. I dare you. 🪄<br><br>— Devashish 🫡<br><span style="font-size:12px;color:${MUTED};">founder, chief form whisperer</span>`,
            cta: { label: "Build your first form 🚀", url: p.url },
        }),
    };
}
