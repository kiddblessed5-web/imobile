// =========================================================
// send-email — lets a signed-in admin send email from the dashboard
// (inbox replies, "Email customer" on orders, test emails).
//
// Called with supabase.functions.invoke("send-email", { body: { to, subject, text } }).
// The caller's login is checked: only users in the admins table can send.
//
// Secrets: RESEND_API_KEY, MAIL_FROM (same as the notify function).
// Optional: REPLY_TO — where customers' answers should go (your normal inbox).
// =========================================================
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  // act as the signed-in user so is_admin() sees who they are
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const { data: isAdmin, error: authError } = await supabase.rpc("is_admin");
  if (authError || !isAdmin) return json({ error: "Not allowed" }, 403);

  const { to, subject, text } = await req.json().catch(() => ({}));
  if (!to || !subject || !text || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
    return json({ error: "to, subject and text are required" }, 400);
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: Deno.env.get("MAIL_FROM"),
      to: [to],
      subject: String(subject).slice(0, 200),
      text: String(text).slice(0, 20000),
      ...(Deno.env.get("REPLY_TO") ? { reply_to: Deno.env.get("REPLY_TO") } : {}),
    }),
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) return json({ error: out?.message || "Email provider error" }, 502);
  return json({ ok: true, id: out.id });
});
