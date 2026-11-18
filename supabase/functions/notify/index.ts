// =========================================================
// notify — emails you when something new arrives
//
// Triggered by Supabase Database Webhooks (INSERT on messages,
// orders and subscribers). Sends:
//   • a notification to the address in Dashboard → Settings
//   • an order confirmation to the customer (orders only)
//
// Secrets (supabase secrets set …):
//   RESEND_API_KEY   your Resend API key
//   MAIL_FROM        e.g.  iMobile <orders@yourstore.co.ke>  (verified domain in Resend)
//   WEBHOOK_SECRET   any long random string; add the same value as the
//                    "x-webhook-secret" header on each database webhook
//   SITE_URL         e.g. https://yourstore.co.ke  (for links in emails)
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically.
// =========================================================
import { createClient } from "jsr:@supabase/supabase-js@2";

const KSH = (n: number) => "KSh " + Math.round(n || 0).toLocaleString("en-KE");

async function send(to: string, subject: string, text: string, replyTo?: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: Deno.env.get("MAIL_FROM"),
      to: [to],
      subject,
      text,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

Deno.serve(async (req) => {
  if (req.headers.get("x-webhook-secret") !== Deno.env.get("WEBHOOK_SECRET")) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { type, table, record: r } = await req.json();
  if (type !== "INSERT" || !r) return new Response("ignored");

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: rows } = await admin.from("site_config").select("id, value").in("id", ["settings", "private"]);
  const cfg = Object.assign({}, ...(rows || []).map((x) => x.value));
  const store = cfg.store_name || "iMobile";
  const to = cfg.notify_email as string | undefined;
  const site = Deno.env.get("SITE_URL") || "";

  try {
    if (table === "messages" && to) {
      await send(
        to,
        `New message: ${r.topic} — ${r.name}`,
        `${r.name} sent a message from the contact page.\n\n` +
          `Topic: ${r.topic}\nEmail: ${r.email}\nPhone: ${r.phone || "—"}\n\n${r.message}\n\n` +
          `Reply from the dashboard: ${site}/admin/#/inbox/${r.id}\n(or just reply to this email)`,
        r.email,
      );
    }

    if (table === "orders") {
      const c = r.customer || {};
      const lines = (r.items || [])
        .map((i: any) => `• ${i.qty} × ${i.name}${i.storage ? " " + i.storage : ""} (${i.color}) — ${KSH(i.unit * i.qty)}`)
        .join("\n");
      const summary = `${lines}\n\nSubtotal: ${KSH(r.subtotal)}\nDelivery: ${r.delivery ? KSH(r.delivery) : "Free"}\nTotal: ${KSH(r.total)}\nPayment: ${r.payment}`;

      if (to) {
        await send(
          to,
          `New order ${r.number} — ${KSH(r.total)}`,
          `${c.name} placed order ${r.number}.\n\nPhone: ${c.phone}\nEmail: ${c.email}\nDelivery: ${c.address}, ${c.town}\n` +
            (r.note ? `Note: ${r.note}\n` : "") + `\n${summary}\n\nOpen it: ${site}/admin/#/orders/${r.id}`,
          c.email,
        );
      }
      if (c.email) {
        await send(
          c.email,
          `We've got your order ${r.number}`,
          `Hi ${(c.name || "").split(" ")[0]},\n\nThanks for shopping with ${store}! We've received your order and will call ${c.phone} shortly to confirm payment and delivery.\n\n${summary}\n\nDelivering to: ${c.address}, ${c.town}\n\n— ${store}`,
          to,
        );
      }
    }

    if (table === "subscribers" && to) {
      await send(to, `New subscriber: ${r.email}`, `${r.email} joined the ${store} newsletter.`);
    }
  } catch (e) {
    console.error(e);
    return new Response(String(e), { status: 500 });
  }

  return new Response("ok");
});
