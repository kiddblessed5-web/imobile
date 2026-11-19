/* =========================================================
   iMobile — data layer shared by the store and the admin dashboard

   Two modes, same API (every method returns a Promise):
   • DEMO  — no Supabase keys in config.js. Data lives in this
             browser's localStorage. Open the site and /admin in the
             same browser and they share it (changes show up live).
   • LIVE  — Supabase keys set. Products, orders, messages,
             subscribers, content and settings are stored in your
             Supabase project; images go to Supabase Storage; emails
             go out through the Edge Functions in /supabase/functions.
   ========================================================= */

const DEFAULT_CONTENT = {
  hero_lede: "Genuine phones, wearables and accessories — with warranty on every device.",
  hero_stat_label: "Brands in stock",
  hero_featured_id: "pulse-watch-2",
  categories_sub: "Shop by your favourite category in seconds.",
  picks_sub: "The devices everyone's asking for right now.",
  deals_title: "Prices drop now",
  deals_text: "Limited-time prices on phones, wearables and accessories. When the clock hits zero, they're gone.",
  deals_end: "", // ISO date-time; empty = this coming Sunday 23:59
  news_title: "Get new drops first",
  news_text: "New arrivals and weekend deals, straight to your inbox.",
  testimonials: [
    { quote: "[Paste a real customer review here — what they bought, how delivery went, how they feel about it.]", name: "[Customer name]", detail: "[Town] · [Product bought]" },
    { quote: "[Short review from a real customer.]", name: "[Customer name]", detail: "[Product bought]" },
    { quote: "[Short review from a real customer.]", name: "[Customer name]", detail: "[Product bought]" },
  ],
  contact_phone: "[+254 7XX XXX XXX]",
  contact_whatsapp: "[+254 7XX XXX XXX]",
  contact_email: "[hello@yourstore.co.ke]",
  contact_address: "[Your store address, City]",
  contact_hours: "[Mon–Sat, 9am–7pm]",
  footer_about: "Genuine phones, wearables and accessories, with warranty and fast delivery.",
};

const DEFAULT_SETTINGS = {
  store_name: "iMobile",
  delivery_fee: 300,
  free_delivery_from: 10000,
  storage_step: 15000,
  notify_email: "",
  accent: "#e11d2e",
  accent_dark: "#ff3347",
  theme: "light",
  demo_admin_email: "admin@demo.store",
  demo_admin_password: "demo1234",
};

const Store = (() => {
  const cfg = window.IMOBILE_CONFIG || {};
  const live = !!(cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase?.createClient);
  const sb = live ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey) : null;
  const bucket = cfg.imageBucket || "product-images";

  const uid = () =>
    (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
  const now = () => new Date().toISOString();
  const slug = (s) =>
    String(s).toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").slice(0, 60) || uid();
  const err = (e) => {
    throw new Error(e?.message || String(e));
  };

  /* ---------------- DEMO (localStorage) ---------------- */
  const KEY = "imobile-db";
  const seed = () => ({
    products: DEFAULT_CATALOGUE.map((p, i) => ({ visible: true, stock: 10, position: i, ...p })),
    orders: [],
    messages: [],
    subscribers: [],
    content: structuredClone(DEFAULT_CONTENT),
    settings: structuredClone(DEFAULT_SETTINGS),
    session: null,
    catalogVersion: CATALOGUE_VERSION,
  });
  const read = () => {
    try {
      const d = JSON.parse(localStorage.getItem(KEY));
      if (d && d.products) {
        // newer starter photos: copy them onto untouched starter products
        if ((d.catalogVersion || 1) < CATALOGUE_VERSION) {
          d.products.forEach((p) => {
            const def = DEFAULT_CATALOGUE.find((x) => x.id === p.id);
            const hasPhoto = p.image || (p.colors || []).some((c) => c.image);
            if (def && !hasPhoto) p.colors = def.colors;
          });
          d.catalogVersion = CATALOGUE_VERSION;
          write(d);
        }
        // the main theme changed from violet to red: move untouched demo settings over
        if (d.settings && /^#7a3bd0$/i.test(d.settings.accent || "")) {
          d.settings.accent = "#e11d2e";
          write(d);
        }
        return d;
      }
    } catch {}
    const d = seed();
    write(d);
    return d;
  };
  const write = (d) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(d));
    } catch (e) {
      err("Browser storage is full — remove some product images or connect Supabase.");
    }
  };
  const change = (fn) => {
    const d = read();
    const out = fn(d);
    write(d);
    return out;
  };

  /* ---------------- helpers for LIVE rows ---------------- */
  const toProduct = (row) => ({ ...row.data, id: row.id, visible: row.visible, stock: row.stock, position: row.position });
  const fromProduct = (p) => {
    const { id, visible = true, stock = 10, position = 0, ...data } = p;
    return { id, visible, stock, position, data, updated_at: now() };
  };

  /* image → small JPEG (keeps demo storage and uploads light) */
  async function compress(file, max = 1000, quality = 0.84) {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = rej;
        i.src = url;
      });
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      return await new Promise((res) => c.toBlob(res, "image/jpeg", quality));
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  const blobToDataURL = (blob) =>
    new Promise((res) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.readAsDataURL(blob);
    });

  /* ================= PUBLIC API ================= */
  const api = {
    mode: live ? "live" : "demo",
    client: sb,
    slug,

    /* ---------- products ---------- */
    async getProducts({ all = false } = {}) {
      if (!live) {
        const list = [...read().products].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        return all ? list : list.filter((p) => p.visible !== false);
      }
      let q = sb.from("products").select("*").order("position");
      if (!all) q = q.eq("visible", true);
      const { data, error } = await q;
      if (error) err(error);
      return data.map(toProduct);
    },
    async saveProduct(p) {
      const product = { ...p, id: p.id || slug(p.name) };
      if (!live)
        return change((d) => {
          const i = d.products.findIndex((x) => x.id === product.id);
          if (i > -1) d.products[i] = product;
          else d.products.push({ position: d.products.length, ...product });
          return product;
        });
      const { error } = await sb.from("products").upsert(fromProduct(product));
      if (error) err(error);
      return product;
    },
    async deleteProduct(id) {
      if (!live) return change((d) => void (d.products = d.products.filter((p) => p.id !== id)));
      const { error } = await sb.from("products").delete().eq("id", id);
      if (error) err(error);
    },

    /* ---------- content & settings (one JSON row each) ---------- */
    async getConfig(kind) {
      const defaults = kind === "content" ? DEFAULT_CONTENT : DEFAULT_SETTINGS;
      if (!live) return { ...defaults, ...read()[kind] };
      // "private" holds admin-only settings (notification email). Visitors can't read it.
      const ids = kind === "settings" ? ["settings", "private"] : [kind];
      const { data, error } = await sb.from("site_config").select("id, value").in("id", ids);
      if (error) err(error);
      return Object.assign({ ...defaults }, ...data.sort((a, b) => (a.id === "private") - (b.id === "private")).map((r) => r.value || {}));
    },
    async saveConfig(kind, value) {
      if (!live) return change((d) => void (d[kind] = { ...d[kind], ...value }));
      const current = await api.getConfig(kind);
      const merged = { ...current, ...value };
      const rows = [];
      if (kind === "settings") {
        const { notify_email = "", demo_admin_email, demo_admin_password, ...pub } = merged;
        rows.push({ id: "settings", value: pub, updated_at: now() }, { id: "private", value: { notify_email }, updated_at: now() });
      } else rows.push({ id: kind, value: merged, updated_at: now() });
      const { error } = await sb.from("site_config").upsert(rows);
      if (error) err(error);
    },
    getContent: () => api.getConfig("content"),
    getSettings: () => api.getConfig("settings"),
    saveContent: (v) => api.saveConfig("content", v),
    saveSettings: (v) => api.saveConfig("settings", v),

    /* ---------- orders ---------- */
    async addOrder(order) {
      const row = { id: uid(), number: "IM-" + Date.now().toString().slice(-6), created_at: now(), status: "pending", notes: "", ...order };
      if (!live) return change((d) => (d.orders.unshift(row), row));
      // anon users can insert but not read orders back, so we don't .select()
      const { error } = await sb.from("orders").insert(row);
      if (error) err(error);
      return row;
    },
    async getOrders() {
      if (!live) return read().orders;
      const { data, error } = await sb.from("orders").select("*").order("created_at", { ascending: false });
      if (error) err(error);
      return data;
    },
    async updateOrder(id, patch) {
      if (!live) return change((d) => Object.assign(d.orders.find((o) => o.id === id) || {}, patch));
      const { error } = await sb.from("orders").update(patch).eq("id", id);
      if (error) err(error);
    },
    async deleteOrder(id) {
      if (!live) return change((d) => void (d.orders = d.orders.filter((o) => o.id !== id)));
      const { error } = await sb.from("orders").delete().eq("id", id);
      if (error) err(error);
    },

    /* ---------- messages (contact form inbox) ---------- */
    async addMessage(m) {
      const row = { id: uid(), created_at: now(), status: "unread", replies: [], ...m };
      if (!live) return change((d) => (d.messages.unshift(row), row));
      const { error } = await sb.from("messages").insert(row);
      if (error) err(error);
      return row;
    },
    async getMessages() {
      if (!live) return read().messages;
      const { data, error } = await sb.from("messages").select("*").order("created_at", { ascending: false });
      if (error) err(error);
      return data;
    },
    async updateMessage(id, patch) {
      if (!live) return change((d) => Object.assign(d.messages.find((m) => m.id === id) || {}, patch));
      const { error } = await sb.from("messages").update(patch).eq("id", id);
      if (error) err(error);
    },
    async deleteMessage(id) {
      if (!live) return change((d) => void (d.messages = d.messages.filter((m) => m.id !== id)));
      const { error } = await sb.from("messages").delete().eq("id", id);
      if (error) err(error);
    },

    /* ---------- newsletter ---------- */
    async addSubscriber(email) {
      email = String(email).trim().toLowerCase();
      if (!live)
        return change((d) => {
          if (!d.subscribers.some((s) => s.email === email)) d.subscribers.unshift({ id: uid(), email, created_at: now() });
        });
      const { error } = await sb.from("subscribers").insert({ email });
      if (error && error.code !== "23505") err(error); // 23505 = already subscribed
    },
    async getSubscribers() {
      if (!live) return read().subscribers;
      const { data, error } = await sb.from("subscribers").select("*").order("created_at", { ascending: false });
      if (error) err(error);
      return data;
    },
    async deleteSubscriber(id) {
      if (!live) return change((d) => void (d.subscribers = d.subscribers.filter((s) => s.id !== id)));
      const { error } = await sb.from("subscribers").delete().eq("id", id);
      if (error) err(error);
    },

    /* ---------- images ---------- */
    async uploadImage(file) {
      const blob = await compress(file);
      if (!live) return blobToDataURL(blob);
      const path = `products/${uid()}.jpg`;
      const { error } = await sb.storage.from(bucket).upload(path, blob, { contentType: "image/jpeg", upsert: false });
      if (error) err(error);
      return sb.storage.from(bucket).getPublicUrl(path).data.publicUrl;
    },

    /* ---------- email (replies, test emails) ---------- */
    async sendEmail({ to, subject, text }) {
      if (!live) {
        // demo: hand over to the person's own email app
        location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
        return { via: "mailto" };
      }
      const { data, error } = await sb.functions.invoke("send-email", { body: { to, subject, text } });
      if (error) err(error);
      return { via: "resend", ...data };
    },

    /* ---------- admin auth ---------- */
    async signIn(email, password) {
      if (!live) {
        const s = { ...DEFAULT_SETTINGS, ...read().settings };
        if (email.trim().toLowerCase() !== s.demo_admin_email || password !== s.demo_admin_password)
          err("Wrong email or password.");
        change((d) => void (d.session = { email, at: now() }));
        return { email };
      }
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) err(error);
      const { data: isAdmin } = await sb.rpc("is_admin");
      if (!isAdmin) {
        await sb.auth.signOut();
        err("This account isn't an admin. Add it to the admins table (see ADMIN.md).");
      }
      return data.user;
    },
    async signOut() {
      if (!live) return change((d) => void (d.session = null));
      await sb.auth.signOut();
    },
    async getUser() {
      if (!live) return read().session;
      const { data } = await sb.auth.getUser();
      if (!data.user) return null;
      const { data: isAdmin } = await sb.rpc("is_admin");
      return isAdmin ? data.user : null;
    },

    /* ---------- live updates ---------- */
    onChange(callback) {
      if (!live) {
        // another tab (e.g. the shop) wrote to the demo database
        window.addEventListener("storage", (e) => e.key === KEY && callback({ source: "demo" }));
        return;
      }
      sb.channel("admin-feed")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (p) => callback({ table: "messages", row: p.new }))
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (p) => callback({ table: "orders", row: p.new }))
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "subscribers" }, (p) => callback({ table: "subscribers", row: p.new }))
        .subscribe();
    },

    /* ---------- backup ---------- */
    async exportAll() {
      const [products, orders, messages, subscribers, content, settings] = await Promise.all([
        api.getProducts({ all: true }), api.getOrders(), api.getMessages(), api.getSubscribers(), api.getContent(), api.getSettings(),
      ]);
      return { exported_at: now(), mode: api.mode, products, orders, messages, subscribers, content, settings };
    },
    async importAll(dump) {
      if (live) {
        for (const p of dump.products || []) await api.saveProduct(p);
        if (dump.content) await api.saveContent(dump.content);
        if (dump.settings) await api.saveSettings(dump.settings);
        return;
      }
      change((d) => {
        ["products", "orders", "messages", "subscribers"].forEach((k) => Array.isArray(dump[k]) && (d[k] = dump[k]));
        if (dump.content) d.content = { ...DEFAULT_CONTENT, ...dump.content };
        if (dump.settings) d.settings = { ...DEFAULT_SETTINGS, ...dump.settings };
      });
    },
    async resetDemo() {
      if (live) err("Reset only works in demo mode.");
      const session = read().session;
      write({ ...seed(), session });
    },

    /* ---------- used by the shop pages on load ---------- */
    async loadSite() {
      const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 5000));
      try {
        const [products, content, settings] = await Promise.race([
          Promise.all([api.getProducts(), api.getContent(), api.getSettings()]),
          timeout,
        ]);
        return { products, content, settings };
      } catch (e) {
        console.warn("Store: using built-in data —", e.message);
        return { products: null, content: { ...DEFAULT_CONTENT }, settings: { ...DEFAULT_SETTINGS } };
      }
    },
  };

  return api;
})();
