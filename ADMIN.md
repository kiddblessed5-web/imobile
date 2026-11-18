# iMobile Admin Dashboard

Open **`/admin/`** (e.g. `https://yourstore.co.ke/admin/`).

| Section | What you can do |
|---|---|
| **Overview** | Revenue, pending orders, unread messages, live products, subscribers, a 14-day revenue chart, latest messages and orders, low-stock alerts |
| **Orders** | Every checkout order. Filter by status, search, open an order to see the customer, the items and the totals. Move it from pending to confirmed, shipped or delivered (or cancelled), add private notes, email the customer, or export a CSV |
| **Products** | Add, edit, hide or delete products. Set photo, name, brand, badge, category, price, "was" price (puts it on Deals), stock (0 = sold out), colours, storage options and specs |
| **Inbox** | Every contact-form message. Unread, archived, search, reply by email, mark unread, delete |
| **Subscribers** | Newsletter sign-ups: search, copy all, export CSV, remove |
| **Site content** | Hero text, the featured product, section subtitles, the deals countdown end date, newsletter text, the 3 testimonials, contact details and footer text |
| **Settings** | Store name, brand colour, delivery fee, free-delivery threshold, storage pricing, notification email, backups (export/import) |

Every change shows on the store as soon as you save.

---

## 1. Demo mode (works straight away)

With `config.js` left empty, the dashboard runs in **demo mode**:

- **Sign in** with `admin@demo.store` / `demo1234`. Change these in Settings.
- **Where data lives:** everything is saved in *this browser*. If you open the store and `/admin` in the same browser, they share the data. A message or order placed on the store pops up in the dashboard live.
- **Email:** replies open your own email app with the reply filled in.

Demo mode is for previews and client demos. **Don't run a real store on it.** The data isn't shared between devices, and the sign-in only protects that one browser.

---

## 2. Go live with Supabase (≈ 20 minutes)

### a. Create the database
1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor → New query**, paste all of [`supabase/schema.sql`](supabase/schema.sql) and press **Run**.
3. Go to **Authentication → Users → Add user**. Enter your email and a strong password, and tick **Auto confirm**.
4. Back in the SQL Editor, run this with your email:
   ```sql
   insert into public.admins (user_id) select id from auth.users where email = 'you@yourstore.co.ke';
   ```

### b. Connect the site
Open **Project Settings → API**, then paste the **Project URL** and the **anon public** key into `config.js`:

```js
window.IMOBILE_CONFIG = {
  supabaseUrl: "https://xxxx.supabase.co",
  supabaseAnonKey: "eyJhbGciOi...",
  imageBucket: "product-images",
};
```

> The anon key is meant to be public. Security comes from the Row Level Security rules in `schema.sql`. **Never** put the `service_role` key in any website file.

### c. Add your products
Sign in at `/admin` with the account from step a, then:

- **Option 1:** go to **Settings → Load starter catalogue** to copy in the 17 template products.
- **Option 2:** if you set up products in demo mode first, go to demo **Settings → Export backup**, then live **Settings → Import backup**.

Then edit or replace the products with your real stock and photos.

---

## 3. Emails (new-message & order alerts, replies)

Emails are sent with [Resend](https://resend.com). It has a free tier.

1. **Set up Resend:** create an account, **add and verify your domain**, then create an **API key**.
2. **Install the Supabase CLI** and link your project:
   ```bash
   npm i -g supabase
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   ```
3. **Set the secrets:**
   ```bash
   supabase secrets set RESEND_API_KEY=re_xxx \
     MAIL_FROM="iMobile <orders@yourstore.co.ke>" \
     REPLY_TO="hello@yourstore.co.ke" \
     WEBHOOK_SECRET="pick-a-long-random-string" \
     SITE_URL="https://yourstore.co.ke"
   ```
4. **Deploy the two functions:**
   ```bash
   supabase functions deploy notify --no-verify-jwt
   supabase functions deploy send-email
   ```
5. **Fire `notify` on every new row:** in **Database → Webhooks → Create webhook**, make three webhooks, one each for the `messages`, `orders` and `subscribers` tables:
   - Events: **Insert**
   - Type: **Supabase Edge Functions** → `notify`, method POST
   - HTTP header: `x-webhook-secret` = the same value as `WEBHOOK_SECRET`
6. **Choose where alerts go:** in the dashboard, under **Settings → Email notifications**, enter the address that should get alerts, then press **Send a test email**.

What you get:
- **New contact message:** an email to you. Hitting *Reply* in your mail app answers the customer directly.
- **New order:** an email to you with the full order, and a confirmation email to the customer.
- **New subscriber:** a short email to you.
- **Replies from the dashboard inbox** (and "Email customer" on orders) are sent from `MAIL_FROM`. When the customer answers, it lands in `REPLY_TO`, your normal mailbox.

---

## 4. Deploy

It's a static site, so you can deploy the folder to **Vercel** (or Netlify, or any static host) as it is. `/admin` is excluded from search engines by `robots.txt` and a `noindex` tag.

## 5. Good to know

- **Prices are checked on the server.** When an order comes in, the database recalculates every price, the delivery fee and the total from your products and settings, and reduces stock. Someone editing the page in their browser can't change what they pay.
- **Payments:** checkout records the order and the chosen method (M-Pesa, card or cash on delivery). You confirm the payment yourself, by phone or M-Pesa, and update the order status. Online payment, such as M-Pesa STK push via Daraja or a card gateway, can be added later as another Edge Function.
- **Images** uploaded in the dashboard are resized to 1000px and stored in the `product-images` bucket.
- **Backups:** use **Settings → Export backup** regularly. It downloads one JSON file with everything.
