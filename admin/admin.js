/* =========================================================
   iMobile Admin — single-page dashboard (vanilla JS)
   Routes: #/overview #/orders #/products #/inbox #/subscribers
           #/content #/settings  (+ /:id for details)
   All data goes through Store (../store.js).
   ========================================================= */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const fmtDate = (iso, opts = {}) =>
  iso ? new Date(iso).toLocaleString("en-KE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", ...opts }) : "—";
const ago = (iso) => {
  const s = (Date.now() - new Date(iso)) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return fmtDate(iso, { hour: undefined, minute: undefined });
};
const initials = (name = "") =>
  name.replace(/[\[\]]/g, "").trim().split(/\s+/).slice(0, 2).map((w) => w[0] || "").join("").toUpperCase() || "?";
const imgSrc = (u) => (!u ? "" : /^(data:|https?:|blob:|\/)/.test(u) ? u : "../" + u);
const media = (p, ci = 0) => {
  const src = p.colors?.[ci]?.image || p.colors?.[0]?.image || p.image;
  return src ? `<img src="${esc(imgSrc(src))}" alt="" />` : deviceArt(p.type || "phone", p.colors?.[ci]?.hex || "#2c2c2f");
};

const I = {
  overview: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>',
  orders: '<svg viewBox="0 0 24 24"><path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  products: '<svg viewBox="0 0 24 24"><rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/></svg>',
  inbox: '<svg viewBox="0 0 24 24"><path d="M4 13h4l2 3h4l2-3h4"/><path d="M5 5h14l1 8v6H4v-6z"/></svg>',
  subs: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  content: '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/></svg>',
  settings: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
  edit: '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  back: '<svg viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
  send: '<svg viewBox="0 0 24 24"><path d="m4 12 16-8-6 16-2-7z"/></svg>',
  money: '<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/></svg>',
  download: '<svg viewBox="0 0 24 24"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>',
  upload: '<svg viewBox="0 0 24 24"><path d="M12 20V9M7 14l5-5 5 5M5 4h14"/></svg>',
  ext: '<svg viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8"/></svg>',
};

const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

/* ---------------- UI helpers ---------------- */
function toast(msg, { bad = false, link } = {}) {
  const t = document.createElement("div");
  t.className = "toast" + (bad ? " is-bad" : "");
  t.innerHTML = `<span>${esc(msg)}</span>${link ? `<a href="${link.href}">${esc(link.label)}</a>` : ""}`;
  $("[data-toasts]").append(t);
  setTimeout(() => t.remove(), 4200);
}

function confirmBox(title, text, okLabel = "Delete") {
  return new Promise((resolve) => {
    const el = document.createElement("div");
    el.className = "confirm";
    el.innerHTML = `<div class="confirm__box" role="alertdialog" aria-modal="true">
      <h3>${esc(title)}</h3><p>${esc(text)}</p>
      <div class="bar"><button class="btn" data-no>Cancel</button><button class="btn btn--primary" data-yes>${esc(okLabel)}</button></div></div>`;
    document.body.append(el);
    $("[data-yes]", el).focus();
    el.addEventListener("click", (e) => {
      if (e.target.closest("[data-yes]")) (el.remove(), resolve(true));
      else if (e.target.closest("[data-no]") || e.target === el) (el.remove(), resolve(false));
    });
  });
}

function drawer(title, bodyHTML, footHTML = "") {
  const el = document.createElement("div");
  el.className = "drawer";
  el.innerHTML = `<aside class="drawer__panel" role="dialog" aria-modal="true" aria-label="${esc(title)}">
    <header class="drawer__head"><h2>${esc(title)}</h2><button class="iconbtn" data-close aria-label="Close">${I.x}</button></header>
    <div class="drawer__body">${bodyHTML}</div>
    ${footHTML ? `<footer class="drawer__foot">${footHTML}</footer>` : ""}</aside>`;
  $("[data-modal-root]").append(el);
  requestAnimationFrame(() => el.classList.add("is-open"));
  const close = () => {
    el.classList.remove("is-open");
    setTimeout(() => el.remove(), 350);
    document.removeEventListener("keydown", onKey);
    if (location.hash.split("/").length > 2) history.replaceState(null, "", "#/" + route().view);
  };
  const onKey = (e) => e.key === "Escape" && close();
  document.addEventListener("keydown", onKey);
  el.addEventListener("click", (e) => {
    if (e.target === el || e.target.closest("[data-close]")) close();
  });
  el.close = close;
  return el;
}

function download(name, text, type = "application/json") {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/* ---------------- state ---------------- */
const S = { user: null, products: [], orders: [], messages: [], subscribers: [], content: {}, settings: {} };

async function refresh(...keys) {
  const all = !keys.length;
  const jobs = [];
  if (all || keys.includes("products")) jobs.push(Store.getProducts({ all: true }).then((v) => (S.products = v)));
  if (all || keys.includes("orders")) jobs.push(Store.getOrders().then((v) => (S.orders = v)));
  if (all || keys.includes("messages")) jobs.push(Store.getMessages().then((v) => (S.messages = v)));
  if (all || keys.includes("subscribers")) jobs.push(Store.getSubscribers().then((v) => (S.subscribers = v)));
  if (all || keys.includes("content")) jobs.push(Store.getContent().then((v) => (S.content = v)));
  if (all || keys.includes("settings")) jobs.push(Store.getSettings().then((v) => (S.settings = v)));
  await Promise.all(jobs);
  // the catalogue the store's helpers (findProduct, deviceArt…) read from
  CATALOGUE = S.products;
  badges();
}

function badges() {
  const unread = S.messages.filter((m) => m.status === "unread").length;
  const pending = S.orders.filter((o) => o.status === "pending").length;
  $$("[data-count-for]").forEach((el) => {
    const n = el.dataset.countFor === "inbox" ? unread : pending;
    el.textContent = n;
    el.hidden = !n;
  });
  $("[data-top-dot]").hidden = !unread;
  document.title = (unread ? `(${unread}) ` : "") + "Dashboard — iMobile";
}

/* ---------------- routing ---------------- */
const VIEWS = {
  overview: { title: "Overview", crumb: "Dashboard", render: viewOverview },
  orders: { title: "Orders", crumb: "Sales", render: viewOrders },
  products: { title: "Products", crumb: "Catalogue", render: viewProducts },
  inbox: { title: "Inbox", crumb: "Customers", render: viewInbox },
  subscribers: { title: "Subscribers", crumb: "Customers", render: viewSubscribers },
  content: { title: "Site content", crumb: "Store front", render: viewContent },
  settings: { title: "Settings", crumb: "Store", render: viewSettings },
};

function route() {
  const [, view = "overview", id] = location.hash.split("/");
  return { view: VIEWS[view] ? view : "overview", id: id ? decodeURIComponent(id) : null };
}

function buildNav() {
  const item = (v, icon, count) =>
    `<a href="#/${v}" data-nav="${v}">${I[icon]}<span>${VIEWS[v].title}</span>${count ? `<span class="count" data-count-for="${count}" hidden>0</span>` : ""}</a>`;
  $("[data-side-nav]").innerHTML = `
    ${item("overview", "overview")}
    <p>Sales</p>${item("orders", "orders", "orders")}${item("products", "products")}
    <p>Customers</p>${item("inbox", "inbox", "inbox")}${item("subscribers", "subs")}
    <p>Store front</p>${item("content", "content")}${item("settings", "settings")}`;
}

async function render() {
  const { view, id } = route();
  $$("[data-nav]").forEach((a) => a.classList.toggle("is-active", a.dataset.nav === view));
  $("[data-title]").textContent = VIEWS[view].title;
  $("[data-crumb]").textContent = VIEWS[view].crumb;
  document.body.classList.remove("side-open");
  const host = $("[data-view]");
  try {
    await VIEWS[view].render(host, id);
  } catch (e) {
    console.error(e);
    host.innerHTML = `<div class="card empty"><strong>Couldn't load this page</strong>${esc(e.message)}</div>`;
  }
}

/* =========================================================
   OVERVIEW
   ========================================================= */
function viewOverview(host) {
  const live = S.orders.filter((o) => o.status !== "cancelled");
  const revenue = live.reduce((s, o) => s + (o.total || 0), 0);
  const pending = S.orders.filter((o) => o.status === "pending").length;
  const unread = S.messages.filter((m) => m.status === "unread").length;
  const visible = S.products.filter((p) => p.visible !== false).length;
  const sold = S.products.filter((p) => p.stock === 0).length;
  const week = S.subscribers.filter((s) => Date.now() - new Date(s.created_at) < 7 * 864e5).length;
  const low = S.products.filter((p) => p.stock > 0 && p.stock <= 3);

  // revenue by day, last 14 days
  const days = [...Array(14)].map((_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (13 - i));
    return { d, total: 0 };
  });
  live.forEach((o) => {
    const t = new Date(o.created_at);
    t.setHours(0, 0, 0, 0);
    const slot = days.find((x) => +x.d === +t);
    if (slot) slot.total += o.total || 0;
  });
  const max = Math.max(1, ...days.map((x) => x.total));
  const W = 700, H = 200, bw = W / 14;
  const bars = days
    .map((x, i) => {
      const h = Math.max(4, (x.total / max) * (H - 40));
      const label = x.d.toLocaleDateString("en-KE", { day: "numeric", month: "short" });
      return `<g><title>${label}: ${money(x.total)}</title>
        <rect class="${x.total ? "has" : ""}" x="${i * bw + 8}" y="${H - 22 - h}" width="${bw - 16}" height="${h}" rx="3"/>
        ${i % 2 === 0 ? `<text x="${i * bw + bw / 2}" y="${H - 4}" text-anchor="middle">${label}</text>` : ""}</g>`;
    })
    .join("");

  const kpi = (icon, label, value, sub, href) => `
    <a href="${href}" class="kpi cut"><span class="cut__notch"><span class="kpi__icon">${I[icon]}</span></span>
      <p>${label}</p><strong>${value}</strong><small>${sub}</small></a>`;

  host.innerHTML = `
    <div class="kpis">
      ${kpi("money", "Revenue", money(revenue), `${live.length} orders (excl. cancelled)`, "#/orders")}
      ${kpi("orders", "Pending orders", pending, "Waiting to be confirmed", "#/orders")}
      ${kpi("inbox", "Unread messages", unread, `${S.messages.length} in total`, "#/inbox")}
      ${kpi("products", "Products live", `${visible}/${S.products.length}`, sold ? `${sold} sold out` : "All in stock", "#/products")}
      ${kpi("subs", "Subscribers", S.subscribers.length, `+${week} this week`, "#/subscribers")}
    </div>

    <div class="grid grid--2">
      <section class="card">
        <header class="card__head"><h2>Revenue — last 14 days</h2><a href="#/orders">All orders</a></header>
        <div class="card__body"><svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Revenue per day">
          <line x1="0" x2="${W}" y1="${H - 22}" y2="${H - 22}"/>${bars}</svg></div>
      </section>
      <section class="card">
        <header class="card__head"><h2>Latest messages</h2><a href="#/inbox">Open inbox</a></header>
        ${S.messages.length ? `<ul class="mini-list">${S.messages.slice(0, 5).map((m) => `
          <li><a href="#/inbox/${m.id}"><span class="ava">${initials(m.name)}</span>
            <span class="txt"><b>${esc(m.name)}${m.status === "unread" ? ' <span class="pill pill--unread">new</span>' : ""}</b><span>${esc(m.topic)} — ${esc(m.message)}</span></span>
            <time>${ago(m.created_at)}</time></a></li>`).join("")}</ul>`
          : `<div class="empty"><strong>No messages yet</strong>Messages from the contact form land here.</div>`}
      </section>
    </div>

    <div class="grid grid--2">
      <section class="card">
        <header class="card__head"><h2>Recent orders</h2><a href="#/orders">View all</a></header>
        ${ordersTable(S.orders.slice(0, 6))}
      </section>
      <section class="card">
        <header class="card__head"><h2>Low stock</h2><a href="#/products">Products</a></header>
        ${low.length || sold ? `<ul class="mini-list">${[...S.products.filter((p) => p.stock === 0), ...low].slice(0, 6).map((p) => `
          <li><a href="#/products/${p.id}"><span class="thumb">${media(p)}</span>
            <span class="txt"><b>${esc(p.name)}</b><span>${esc(p.brand || "")}</span></span>
            <span class="pill ${p.stock === 0 ? "pill--out" : "pill--low"}">${p.stock === 0 ? "sold out" : p.stock + " left"}</span></a></li>`).join("")}</ul>`
          : `<div class="empty"><strong>Stock looks healthy</strong>Products with 3 or fewer left show here.</div>`}
      </section>
    </div>`;
}

/* =========================================================
   ORDERS
   ========================================================= */
function ordersTable(list) {
  if (!list.length)
    return `<div class="empty"><strong>No orders yet</strong>Orders placed at checkout appear here.</div>`;
  return `<div class="table-wrap"><table><thead><tr>
      <th>Order</th><th>Customer</th><th class="hide-sm">Items</th><th>Total</th><th class="hide-sm">Payment</th><th>Status</th></tr></thead>
    <tbody>${list.map((o) => `
      <tr data-href="#/orders/${o.id}">
        <td><b>${esc(o.number)}</b><span class="sub">${fmtDate(o.created_at)}</span></td>
        <td>${esc(o.customer?.name)}<span class="sub">${esc(o.customer?.phone)}</span></td>
        <td class="hide-sm">${(o.items || []).reduce((n, i) => n + i.qty, 0)}</td>
        <td class="num">${money(o.total || 0)}</td>
        <td class="hide-sm">${esc(o.payment)}</td>
        <td><span class="pill pill--${o.status}">${o.status}</span></td>
      </tr>`).join("")}</tbody></table></div>`;
}

function viewOrders(host, id) {
  const st = (viewOrders.st ||= { status: "all", q: "" });
  const draw = () => {
    const q = st.q.toLowerCase();
    const list = S.orders.filter(
      (o) =>
        (st.status === "all" || o.status === st.status) &&
        (!q || [o.number, o.customer?.name, o.customer?.phone, o.customer?.email].join(" ").toLowerCase().includes(q))
    );
    $("[data-orders]", host).innerHTML = ordersTable(list);
  };
  const count = (s) => S.orders.filter((o) => s === "all" || o.status === s).length;
  host.innerHTML = `
    <div class="bar">
      <div class="tabs" role="tablist">${["all", ...ORDER_STATUSES].map((s) =>
        `<button data-st="${s}" class="${st.status === s ? "is-active" : ""}" style="text-transform:capitalize">${s} <small>${count(s)}</small></button>`).join("")}</div>
      <label class="search">${I.search}<input class="inp" placeholder="Search order, name, phone" value="${esc(st.q)}" data-q /></label>
      <span class="spacer"></span>
      <button class="btn" data-export>${I.download} Export CSV</button>
    </div>
    <section class="card" data-orders></section>`;
  draw();
  $$("[data-st]", host).forEach((b) =>
    b.addEventListener("click", () => {
      st.status = b.dataset.st;
      $$("[data-st]", host).forEach((x) => x.classList.toggle("is-active", x === b));
      draw();
    })
  );
  $("[data-q]", host).addEventListener("input", (e) => ((st.q = e.target.value), draw()));
  $("[data-export]", host).addEventListener("click", () => {
    const rows = [["Order", "Date", "Name", "Phone", "Email", "Town", "Address", "Items", "Total", "Payment", "Status"]];
    S.orders.forEach((o) =>
      rows.push([o.number, o.created_at, o.customer?.name, o.customer?.phone, o.customer?.email, o.customer?.town, o.customer?.address,
        (o.items || []).map((i) => `${i.qty}x ${i.name}`).join("; "), o.total, o.payment, o.status])
    );
    download("orders.csv", rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n"), "text/csv");
  });
  if (id) openOrder(id);
}

function openOrder(id) {
  const o = S.orders.find((x) => x.id === id);
  if (!o) return toast("Order not found", { bad: true });
  const c = o.customer || {};
  const phone = (c.phone || "").replace(/[^\d+]/g, "");
  const wa = phone.replace(/^\+/, "").replace(/^0/, "254");
  const d = drawer(
    `Order ${o.number}`,
    `<div class="sec"><h3>Status</h3>
       <div class="status-picker">${ORDER_STATUSES.map((s) => `<button data-set="${s}" class="${o.status === s ? "is-active" : ""}">${s}</button>`).join("")}</div>
       <p class="muted" style="font-size:13px">Placed ${fmtDate(o.created_at)} · Payment: ${esc(o.payment)}</p></div>
     <div class="sec"><h3>Customer</h3><dl class="kv">
       <dt>Name</dt><dd>${esc(c.name)}</dd>
       <dt>Phone</dt><dd><a href="tel:${esc(phone)}">${esc(c.phone)}</a> · <a href="https://wa.me/${esc(wa)}" target="_blank" rel="noopener">WhatsApp</a></dd>
       <dt>Email</dt><dd><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></dd>
       <dt>Delivery</dt><dd>${esc(c.address)}, ${esc(c.town)}</dd>
       ${o.note ? `<dt>Customer note</dt><dd>${esc(o.note)}</dd>` : ""}</dl></div>
     <div class="sec"><h3>Items</h3><ul class="items">${(o.items || []).map((i) => `
       <li><div><b>${i.qty} × ${esc(i.name)}</b><span>${esc(i.color)}${i.storage ? " · " + esc(i.storage) : ""} · ${money(i.unit)} each</span></div><b>${money(i.unit * i.qty)}</b></li>`).join("")}</ul>
       <dl class="totals"><dt>Subtotal</dt><dd>${money(o.subtotal || 0)}</dd><dt>Delivery</dt><dd>${o.delivery ? money(o.delivery) : "Free"}</dd>
       <dt class="grand">Total</dt><dd class="grand">${money(o.total || 0)}</dd></dl></div>
     <div class="sec"><h3>Internal notes</h3>
       <textarea class="inp" data-notes placeholder="Only you can see this — e.g. 'Paid via M-Pesa, ref QWE123'">${esc(o.notes || "")}</textarea></div>`,
    `<button class="btn btn--danger" data-del>${I.trash} Delete</button><span style="flex:1"></span>
     <button class="btn" data-mail>${I.send} Email customer</button><button class="btn btn--primary" data-save>Save notes</button>`
  );
  $$("[data-set]", d).forEach((b) =>
    b.addEventListener("click", async () => {
      await Store.updateOrder(o.id, { status: b.dataset.set });
      o.status = b.dataset.set;
      $$("[data-set]", d).forEach((x) => x.classList.toggle("is-active", x === b));
      toast(`Order ${o.number} marked ${o.status}`);
      await refresh("orders");
      if (route().view === "orders") viewOrders($("[data-view]"));
    })
  );
  $("[data-save]", d).addEventListener("click", async () => {
    await Store.updateOrder(o.id, { notes: $("[data-notes]", d).value });
    toast("Notes saved");
    refresh("orders");
  });
  $("[data-mail]", d).addEventListener("click", () =>
    composeEmail({
      to: c.email,
      subject: `Your ${S.settings.store_name} order ${o.number}`,
      text: `Hi ${(c.name || "").split(" ")[0]},\n\nThanks for your order ${o.number}. Its status is now: ${o.status}.\n\n— ${S.settings.store_name}`,
    })
  );
  $("[data-del]", d).addEventListener("click", async () => {
    if (!(await confirmBox("Delete this order?", `Order ${o.number} will be removed permanently.`))) return;
    await Store.deleteOrder(o.id);
    d.close();
    await refresh("orders");
    render();
    toast("Order deleted");
  });
}

/* =========================================================
   PRODUCTS
   ========================================================= */
function viewProducts(host, id) {
  const st = (viewProducts.st ||= { q: "", cat: "all" });
  const draw = () => {
    const q = st.q.toLowerCase();
    const list = S.products.filter(
      (p) => (st.cat === "all" || p.category === st.cat) && (!q || [p.name, p.brand, p.sub].join(" ").toLowerCase().includes(q))
    );
    $("[data-list]", host).innerHTML = list.length
      ? `<div class="table-wrap"><table><thead><tr><th>Product</th><th class="hide-sm">Category</th><th>Price</th><th>Stock</th><th>On site</th><th></th></tr></thead>
        <tbody>${list.map((p) => `
          <tr>
            <td><div class="prod"><span class="thumb">${media(p)}</span><div><b>${esc(p.name)}</b><span class="sub">${esc(p.brand || "")}${p.tag ? " · " + esc(p.tag) : ""}</span></div></div></td>
            <td class="hide-sm">${esc(p.category === "phones" ? "Phones" : p.sub || "Accessories")}</td>
            <td class="num">${money(p.price)}${p.was ? `<span class="sub"><s>${money(p.was)}</s></span>` : ""}</td>
            <td>${p.stock === 0 ? '<span class="pill pill--out">sold out</span>' : p.stock <= 3 ? `<span class="pill pill--low">${p.stock} left</span>` : p.stock}</td>
            <td><label class="switch"><input type="checkbox" data-vis="${p.id}" ${p.visible !== false ? "checked" : ""} /><i></i><span class="sr-only">Show on site</span></label></td>
            <td><div class="row-actions"><a class="btn btn--sm" href="#/products/${p.id}">${I.edit} Edit</a>
              <button class="btn btn--sm btn--danger" data-del="${p.id}" aria-label="Delete ${esc(p.name)}">${I.trash}</button></div></td>
          </tr>`).join("")}</tbody></table></div>`
      : `<div class="empty"><strong>No products found</strong>Try another search, or add a product.</div>`;
  };
  host.innerHTML = `
    <div class="bar">
      <div class="tabs">${[["all", "All"], ["phones", "Phones"], ["accessories", "Accessories"]].map(([k, l]) =>
        `<button data-cat="${k}" class="${st.cat === k ? "is-active" : ""}">${l} <small>${S.products.filter((p) => k === "all" || p.category === k).length}</small></button>`).join("")}</div>
      <label class="search">${I.search}<input class="inp" placeholder="Search products" value="${esc(st.q)}" data-q /></label>
      <span class="spacer"></span>
      <a class="btn btn--primary" href="#/products/new">${I.plus} Add product</a>
    </div>
    <section class="card" data-list></section>`;
  draw();
  $$("[data-cat]", host).forEach((b) =>
    b.addEventListener("click", () => {
      st.cat = b.dataset.cat;
      $$("[data-cat]", host).forEach((x) => x.classList.toggle("is-active", x === b));
      draw();
    })
  );
  $("[data-q]", host).addEventListener("input", (e) => ((st.q = e.target.value), draw()));
  host.addEventListener("change", async (e) => {
    const t = e.target.closest("[data-vis]");
    if (!t) return;
    const p = S.products.find((x) => x.id === t.dataset.vis);
    await Store.saveProduct({ ...p, visible: t.checked });
    p.visible = t.checked;
    toast(`${p.name} is now ${t.checked ? "visible" : "hidden"} on the site`);
  });
  host.addEventListener("click", async (e) => {
    const t = e.target.closest("[data-del]");
    if (!t) return;
    const p = S.products.find((x) => x.id === t.dataset.del);
    if (!(await confirmBox(`Delete ${p.name}?`, "It will be removed from the store. Tip: switch “On site” off to hide it instead."))) return;
    await Store.deleteProduct(p.id);
    await refresh("products");
    draw();
    toast("Product deleted");
  });
  if (id) openProduct(id === "new" ? null : id);
}

function openProduct(id) {
  const existing = id ? S.products.find((p) => p.id === id) : null;
  if (id && !existing) return toast("Product not found", { bad: true });
  const p = structuredClone(
    existing || { name: "", brand: "", category: "phones", sub: "", type: "phone", price: 0, was: null, tag: "", stock: 10, visible: true,
      colors: [{ name: "Black", hex: "#222224" }], storage: [], blurb: "", specs: {}, image: "" }
  );
  const subs = ["Smartwatches", "Earbuds", "Chargers & Cables", "Power Banks", "Cases"];
  const types = ["phone", "tablet", "watch", "earbuds", "charger", "cable", "powerbank", "case"];
  const colorRow = (c = { name: "", hex: "#222224" }) =>
    `<div${c.image ? ` data-img="${esc(c.image)}"` : ""}><input class="inp" data-cname placeholder="Colour name" value="${esc(c.name)}" /><input class="inp" type="color" data-chex value="${esc(c.hex)}" />
      <button type="button" class="iconbtn" data-rm aria-label="Remove">${I.x}</button></div>`;
  const specRow = (k = "", v = "") =>
    `<div><input class="inp" data-sk placeholder="e.g. Battery" value="${esc(k)}" /><input class="inp" data-sv placeholder="e.g. 5,000 mAh" value="${esc(v)}" />
      <button type="button" class="iconbtn" data-rm aria-label="Remove">${I.x}</button></div>`;

  const d = drawer(
    existing ? `Edit ${existing.name}` : "Add product",
    `<form class="form-grid" data-pform>
      <div class="sec"><h3>Photo</h3>
        <div class="imgdrop"><div class="imgdrop__preview" data-preview>${media(p)}</div>
          <div class="imgdrop__actions">
            <label class="btn">${I.upload} Upload photo<input type="file" accept="image/*" data-file hidden /></label>
            <button type="button" class="btn btn--ghost" data-clearimg ${p.image || (p.colors || []).some((c) => c.image) ? "" : "hidden"}>Use drawn artwork</button>
            <small class="muted" style="width:100%">JPG or PNG. Resized to 1000px automatically. Without a photo, a drawn device in the first colour is shown.</small>
          </div></div></div>

      <div class="sec"><h3>Details</h3>
        <label class="fld"><span>Name</span><input class="inp" name="name" required value="${esc(p.name)}" /></label>
        <div class="two">
          <label class="fld"><span>Brand</span><input class="inp" name="brand" value="${esc(p.brand)}" /></label>
          <label class="fld"><span>Label (badge)</span><input class="inp" name="tag" placeholder="New, Bestseller, Hot…" value="${esc(p.tag || "")}" /></label>
        </div>
        <div class="three">
          <label class="fld"><span>Category</span><select class="inp" name="category">
            <option value="phones" ${p.category === "phones" ? "selected" : ""}>Phones & tablets</option>
            <option value="accessories" ${p.category === "accessories" ? "selected" : ""}>Accessories</option></select></label>
          <label class="fld" data-subwrap ${p.category === "phones" ? "hidden" : ""}><span>Accessory type</span><select class="inp" name="sub">
            ${subs.map((s) => `<option ${p.sub === s ? "selected" : ""}>${s}</option>`).join("")}</select></label>
          <label class="fld"><span>Artwork style</span><select class="inp" name="type">
            ${types.map((t) => `<option ${p.type === t ? "selected" : ""}>${t}</option>`).join("")}</select></label>
        </div>
        <label class="fld"><span>Short description</span><textarea class="inp" name="blurb" rows="3">${esc(p.blurb)}</textarea></label>
      </div>

      <div class="sec"><h3>Price & stock</h3>
        <div class="three">
          <label class="fld"><span>Price (KSh)</span><input class="inp" name="price" type="number" min="0" step="1" required value="${p.price || ""}" /></label>
          <label class="fld"><span>Was (KSh)</span><input class="inp" name="was" type="number" min="0" step="1" value="${p.was || ""}" /><small>Fill in to put it on the Deals page</small></label>
          <label class="fld"><span>In stock</span><input class="inp" name="stock" type="number" min="0" step="1" value="${p.stock ?? 10}" /><small>0 = sold out</small></label>
        </div>
        <label class="switch"><input type="checkbox" name="visible" ${p.visible !== false ? "checked" : ""} /><i></i>Show on the site</label>
      </div>

      <div class="sec"><h3>Colours</h3><div class="rows colors" data-colors>${(p.colors || []).map(colorRow).join("")}</div>
        <button type="button" class="btn btn--sm" data-addcolor style="justify-self:start">${I.plus} Add colour</button></div>

      <div class="sec"><h3>Storage options</h3>
        <label class="fld"><input class="inp" name="storage" placeholder="e.g. 128GB, 256GB, 512GB" value="${esc((p.storage || []).join(", "))}" />
        <small>Comma-separated. Leave empty for accessories. Each step adds the storage price from Settings.</small></label></div>

      <div class="sec"><h3>Specifications</h3><div class="rows" data-specs>${Object.entries(p.specs || {}).map(([k, v]) => specRow(k, v)).join("")}</div>
        <button type="button" class="btn btn--sm" data-addspec style="justify-self:start">${I.plus} Add spec</button></div>
    </form>`,
    `${existing ? `<a class="btn" href="../product.html?id=${encodeURIComponent(existing.id)}" target="_blank" rel="noopener">${I.ext} View</a>` : ""}
     <span style="flex:1"></span><button class="btn" data-close>Cancel</button><button class="btn btn--primary" data-psave>Save product</button>`
  );
  const form = $("[data-pform]", d);
  const refreshPreview = () => ($("[data-preview]", d).innerHTML = media({ ...p, type: form.elements.type.value, colors: readColors() }));
  const readColors = () =>
    $$("[data-colors] > div", d).map((r) => {
      const c = { name: $("[data-cname]", r).value.trim() || "Default", hex: $("[data-chex]", r).value };
      if (r.dataset.img) c.image = r.dataset.img;
      return c;
    });

  form.category.addEventListener("change", () => ($("[data-subwrap]", d).hidden = form.category.value === "phones"));
  form.elements.type.addEventListener("change", refreshPreview);
  d.addEventListener("input", (e) => e.target.matches("[data-chex]") && refreshPreview());
  d.addEventListener("click", (e) => {
    if (e.target.closest("[data-rm]")) e.target.closest(".rows > div").remove(), refreshPreview();
  });
  $("[data-addcolor]", d).addEventListener("click", () => $("[data-colors]", d).insertAdjacentHTML("beforeend", colorRow()));
  $("[data-addspec]", d).addEventListener("click", () => $("[data-specs]", d).insertAdjacentHTML("beforeend", specRow()));
  $("[data-file]", d).addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      toast("Uploading photo…");
      p.image = await Store.uploadImage(file);
      $$("[data-colors] > div", d).forEach((r) => delete r.dataset.img);
      refreshPreview();
      $("[data-clearimg]", d).hidden = false;
    } catch (err) {
      toast(err.message, { bad: true });
    }
  });
  $("[data-clearimg]", d).addEventListener("click", (e) => {
    p.image = "";
    $$("[data-colors] > div", d).forEach((r) => delete r.dataset.img);
    e.currentTarget.hidden = true;
    refreshPreview();
  });

  $("[data-psave]", d).addEventListener("click", async () => {
    if (!form.elements.name.value.trim() || !(Number(form.price.value) >= 0) || form.price.value === "") {
      form.reportValidity();
      return toast("Name and price are required", { bad: true });
    }
    const specs = {};
    $$("[data-specs] > div", d).forEach((r) => {
      const k = $("[data-sk]", r).value.trim();
      if (k) specs[k] = $("[data-sv]", r).value.trim();
    });
    const product = {
      ...p,
      id: existing?.id || Store.slug(form.elements.name.value),
      name: form.elements.name.value.trim(),
      brand: form.brand.value.trim(),
      tag: form.tag.value.trim() || undefined,
      category: form.category.value,
      sub: form.category.value === "accessories" ? form.sub.value : undefined,
      type: form.elements.type.value,
      blurb: form.blurb.value.trim(),
      price: Math.round(Number(form.price.value)),
      was: form.was.value ? Math.round(Number(form.was.value)) : undefined,
      stock: Math.max(0, Math.round(Number(form.stock.value || 0))),
      visible: form.visible.checked,
      colors: readColors().length ? readColors() : [{ name: "Default", hex: "#222224" }],
      storage: form.storage.value.split(",").map((s) => s.trim()).filter(Boolean),
      specs,
    };
    if (!product.storage.length) delete product.storage;
    if (!existing && S.products.some((x) => x.id === product.id)) product.id += "-" + Date.now().toString(36).slice(-4);
    try {
      await Store.saveProduct(product);
      await refresh("products");
      d.close();
      viewProducts($("[data-view]"));
      toast(`${product.name} saved`, { link: { href: `../product.html?id=${product.id}`, label: "View" } });
    } catch (err) {
      toast(err.message, { bad: true });
    }
  });
}

/* =========================================================
   INBOX
   ========================================================= */
function viewInbox(host, id) {
  const st = (viewInbox.st ||= { box: "inbox", q: "" });
  const boxes = {
    inbox: (m) => m.status !== "archived",
    unread: (m) => m.status === "unread",
    archived: (m) => m.status === "archived",
  };
  const list = () => {
    const q = st.q.toLowerCase();
    return S.messages.filter((m) => boxes[st.box](m) && (!q || [m.name, m.email, m.topic, m.message].join(" ").toLowerCase().includes(q)));
  };
  host.innerHTML = `
    <div class="bar">
      <div class="tabs">${[["inbox", "Inbox"], ["unread", "Unread"], ["archived", "Archived"]].map(([k, l]) =>
        `<button data-box="${k}" class="${st.box === k ? "is-active" : ""}">${l} <small>${S.messages.filter(boxes[k]).length}</small></button>`).join("")}</div>
      <label class="search">${I.search}<input class="inp" placeholder="Search messages" value="${esc(st.q)}" data-q /></label>
    </div>
    <section class="card inbox" data-inbox><div class="inbox__list" data-mlist></div><div class="reader" data-reader></div></section>`;

  const drawList = () => {
    const items = list();
    $("[data-mlist]", host).innerHTML = items.length
      ? items.map((m) => `
        <article class="msg ${m.status === "unread" ? "is-unread" : ""} ${m.id === st.open ? "is-active" : ""}" data-open="${m.id}" tabindex="0">
          <span class="ava">${initials(m.name)}</span>
          <div style="min-width:0"><div class="msg__top"><b>${esc(m.name)}</b><time>${ago(m.created_at)}</time></div>
          <p class="msg__topic">${esc(m.topic)}</p><p class="msg__snip">${esc(m.message)}</p></div>
        </article>`).join("")
      : `<div class="empty"><strong>${st.box === "archived" ? "Nothing archived" : "All caught up"}</strong>Messages sent from the contact page appear here${S.settings.notify_email ? `, and are emailed to ${esc(S.settings.notify_email)}` : ""}.</div>`;
  };

  const openMsg = async (mid) => {
    const m = S.messages.find((x) => x.id === mid);
    if (!m) return;
    st.open = mid;
    if (m.status === "unread") {
      m.status = "read";
      Store.updateMessage(m.id, { status: "read" }).then(badges);
      badges();
    }
    history.replaceState(null, "", `#/inbox/${mid}`);
    drawList();
    $("[data-inbox]", host).classList.add("is-reading");
    const phone = (m.phone || "").replace(/[^\d+]/g, "");
    $("[data-reader]", host).innerHTML = `
      <header class="reader__head">
        <div><button class="btn btn--sm btn--ghost back" data-back>${I.back} Back</button>
          <h2>${esc(m.topic)}</h2>
          <div class="reader__meta"><span><b>${esc(m.name)}</b></span><a href="mailto:${esc(m.email)}">${esc(m.email)}</a>
            ${m.phone ? `<a href="tel:${esc(phone)}">${esc(m.phone)}</a>` : ""}<span>${fmtDate(m.created_at)}</span>
            <span class="pill pill--${m.status}">${m.status}</span></div></div>
        <div class="bar">
          <button class="btn btn--sm" data-unread>Mark unread</button>
          <button class="btn btn--sm" data-archive>${m.status === "archived" ? "Move to inbox" : "Archive"}</button>
          <button class="btn btn--sm btn--danger" data-delmsg aria-label="Delete">${I.trash}</button>
        </div>
      </header>
      <div class="reader__body">${esc(m.message)}</div>
      ${(m.replies || []).length ? `<div class="replies">${m.replies.map((r) => `<article><small>You replied · ${fmtDate(r.at)}</small>${esc(r.text)}</article>`).join("")}</div>` : ""}
      <form class="reply" data-reply>
        <label class="fld"><span>Reply to ${esc(m.name.split(" ")[0])}</span>
          <textarea class="inp" name="text" required>Hi ${esc(m.name.split(" ")[0])},\n\n\n\n— ${esc(S.settings.store_name)}</textarea></label>
        <div class="bar"><small class="muted">${Store.mode === "live" ? "Sends from your store email via Resend." : "Demo mode: opens your email app with this reply filled in."}</small>
          <span class="spacer"></span><button class="btn btn--primary" type="submit">${I.send} Send reply</button></div>
      </form>`;
    const r = $("[data-reader]", host);
    $("[data-back]", r).addEventListener("click", () => {
      $("[data-inbox]", host).classList.remove("is-reading");
      st.open = null;
      history.replaceState(null, "", "#/inbox");
      drawList();
    });
    $("[data-unread]", r).addEventListener("click", async () => {
      await Store.updateMessage(m.id, { status: "unread" });
      m.status = "unread";
      badges();
      drawList();
      toast("Marked as unread");
    });
    $("[data-archive]", r).addEventListener("click", async () => {
      const status = m.status === "archived" ? "read" : "archived";
      await Store.updateMessage(m.id, { status });
      m.status = status;
      st.open = null;
      viewInbox(host);
      toast(status === "archived" ? "Archived" : "Moved to inbox");
    });
    $("[data-delmsg]", r).addEventListener("click", async () => {
      if (!(await confirmBox("Delete this message?", "This can't be undone."))) return;
      await Store.deleteMessage(m.id);
      await refresh("messages");
      st.open = null;
      viewInbox(host);
      toast("Message deleted");
    });
    $("[data-reply]", r).addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = e.target.text.value.trim();
      if (!text) return;
      const btn = e.target.querySelector("button[type=submit]");
      btn.disabled = true;
      try {
        await Store.sendEmail({ to: m.email, subject: `Re: ${m.topic}`, text });
        const replies = [...(m.replies || []), { at: new Date().toISOString(), text }];
        await Store.updateMessage(m.id, { replies, status: "replied" });
        Object.assign(m, { replies, status: "replied" });
        toast(Store.mode === "live" ? "Reply sent" : "Reply opened in your email app and saved here");
        openMsg(m.id);
      } catch (err) {
        toast(err.message, { bad: true });
        btn.disabled = false;
      }
    });
  };

  drawList();
  $("[data-reader]", host).innerHTML = `<div class="empty" style="margin:auto"><strong>Select a message</strong>Pick one from the list to read and reply.</div>`;
  $$("[data-box]", host).forEach((b) =>
    b.addEventListener("click", () => {
      st.box = b.dataset.box;
      $$("[data-box]", host).forEach((x) => x.classList.toggle("is-active", x === b));
      drawList();
    })
  );
  $("[data-q]", host).addEventListener("input", (e) => ((st.q = e.target.value), drawList()));
  $("[data-mlist]", host).addEventListener("click", (e) => {
    const a = e.target.closest("[data-open]");
    if (a) openMsg(a.dataset.open);
  });
  $("[data-mlist]", host).addEventListener("keydown", (e) => {
    const a = e.target.closest("[data-open]");
    if (a && e.key === "Enter") openMsg(a.dataset.open);
  });
  if (id) openMsg(id);
}

/* =========================================================
   SUBSCRIBERS
   ========================================================= */
function viewSubscribers(host) {
  const st = (viewSubscribers.st ||= { q: "" });
  const draw = () => {
    const list = S.subscribers.filter((s) => !st.q || s.email.includes(st.q.toLowerCase()));
    $("[data-list]", host).innerHTML = list.length
      ? `<div class="table-wrap"><table><thead><tr><th>Email</th><th>Joined</th><th></th></tr></thead><tbody>
        ${list.map((s) => `<tr><td><a href="mailto:${esc(s.email)}">${esc(s.email)}</a></td><td>${fmtDate(s.created_at)}</td>
          <td><div class="row-actions"><button class="btn btn--sm btn--danger" data-del="${s.id}" aria-label="Remove">${I.trash}</button></div></td></tr>`).join("")}
        </tbody></table></div>`
      : `<div class="empty"><strong>No subscribers yet</strong>Sign-ups from the home page newsletter form appear here.</div>`;
  };
  host.innerHTML = `
    <div class="bar">
      <label class="search">${I.search}<input class="inp" placeholder="Search email" data-q value="${esc(st.q)}" /></label>
      <span class="spacer"></span>
      <button class="btn" data-copy>Copy all emails</button>
      <button class="btn btn--primary" data-csv>${I.download} Export CSV</button>
    </div>
    <section class="card" data-list></section>`;
  draw();
  $("[data-q]", host).addEventListener("input", (e) => ((st.q = e.target.value), draw()));
  $("[data-copy]", host).addEventListener("click", async () => {
    await navigator.clipboard?.writeText(S.subscribers.map((s) => s.email).join(", "));
    toast(`${S.subscribers.length} emails copied`);
  });
  $("[data-csv]", host).addEventListener("click", () =>
    download("subscribers.csv", ["email,joined", ...S.subscribers.map((s) => `${s.email},${s.created_at}`)].join("\n"), "text/csv")
  );
  host.addEventListener("click", async (e) => {
    const t = e.target.closest("[data-del]");
    if (!t || !(await confirmBox("Remove subscriber?", "They won't get newsletter emails any more.", "Remove"))) return;
    await Store.deleteSubscriber(t.dataset.del);
    await refresh("subscribers");
    draw();
    toast("Subscriber removed");
  });
}

/* =========================================================
   CONTENT
   ========================================================= */
function viewContent(host) {
  const c = S.content;
  const field = (key, label, { area = false, hint = "", type = "text" } = {}) =>
    `<label class="fld"><span>${label}</span>${area
      ? `<textarea class="inp" name="${key}" rows="3">${esc(c[key])}</textarea>`
      : `<input class="inp" type="${type}" name="${key}" value="${esc(c[key])}" />`}${hint ? `<small>${hint}</small>` : ""}</label>`;
  const localDT = (() => {
    if (!c.deals_end) return "";
    const d = new Date(c.deals_end);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); // show in local time
    return d.toISOString().slice(0, 16);
  })();
  const t = c.testimonials || [];

  host.innerHTML = `
    <form class="form-grid" data-cform novalidate>
      <section class="card"><header class="card__head"><h2>Hero</h2><a href="../index.html" target="_blank" rel="noopener">Preview ↗</a></header>
        <div class="card__body form-grid">
          ${field("hero_lede", "Intro line", { area: true })}
          <div class="two">
            ${field("hero_stat_label", "Stat label", { hint: "The number is your brand count, worked out automatically." })}
            <label class="fld"><span>Featured product (bottom-right card)</span><select class="inp" name="hero_featured_id">
              ${S.products.map((p) => `<option value="${p.id}" ${p.id === c.hero_featured_id ? "selected" : ""}>${esc(p.name)}</option>`).join("")}</select></label>
          </div></div></section>

      <section class="card"><header class="card__head"><h2>Home page sections</h2></header>
        <div class="card__body form-grid">
          <div class="two">${field("categories_sub", "Featured categories — subtitle")}${field("picks_sub", "Hot picks — subtitle")}</div>
          <div class="two">${field("deals_title", "Deals — title")}
            <label class="fld"><span>Deals end</span><input class="inp" type="datetime-local" name="deals_end" value="${localDT}" />
            <small>Leave empty to count down to every Sunday midnight.</small></label></div>
          ${field("deals_text", "Deals — text", { area: true })}
          <div class="two">${field("news_title", "Newsletter — title")}${field("news_text", "Newsletter — text")}</div>
        </div></section>

      <section class="card"><header class="card__head"><h2>Testimonials</h2></header>
        <div class="card__body form-grid">
          <p class="note">Use real reviews from real customers, with their permission. The first one is the large card.</p>
          ${[0, 1, 2].map((i) => `
            <div class="sec"><h3>${i === 0 ? "Large card" : `Small card ${i}`}</h3>
              <label class="fld"><span>Review</span><textarea class="inp" data-t="${i}" data-tk="quote" rows="3">${esc(t[i]?.quote)}</textarea></label>
              <div class="two"><label class="fld"><span>Name</span><input class="inp" data-t="${i}" data-tk="name" value="${esc(t[i]?.name)}" /></label>
                <label class="fld"><span>Detail</span><input class="inp" data-t="${i}" data-tk="detail" value="${esc(t[i]?.detail)}" placeholder="Town · Product bought" /></label></div></div>`).join("")}
        </div></section>

      <section class="card"><header class="card__head"><h2>Contact details & footer</h2><a href="../contact.html" target="_blank" rel="noopener">Preview ↗</a></header>
        <div class="card__body form-grid">
          <div class="two">${field("contact_phone", "Phone")}${field("contact_whatsapp", "WhatsApp number")}</div>
          <div class="two">${field("contact_email", "Email")}${field("contact_hours", "Opening hours")}</div>
          ${field("contact_address", "Store address")}
          ${field("footer_about", "Footer — about text", { area: true })}
        </div></section>

      <div class="savebar"><p>Changes go live on the store as soon as you save.</p><button class="btn btn--primary" type="submit">Save content</button></div>
    </form>`;

  $("[data-cform]", host).addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    const value = {};
    $$("input[name], textarea[name], select[name]", f).forEach((el) => (value[el.name] = el.value.trim()));
    value.deals_end = f.deals_end.value ? new Date(f.deals_end.value).toISOString() : "";
    value.testimonials = [0, 1, 2].map((i) => ({
      quote: $(`[data-t="${i}"][data-tk="quote"]`, f).value.trim(),
      name: $(`[data-t="${i}"][data-tk="name"]`, f).value.trim(),
      detail: $(`[data-t="${i}"][data-tk="detail"]`, f).value.trim(),
    }));
    try {
      await Store.saveContent(value);
      await refresh("content");
      toast("Content saved — it's live on the store", { link: { href: "../index.html", label: "View" } });
    } catch (err) {
      toast(err.message, { bad: true });
    }
  });
}

/* =========================================================
   SETTINGS
   ========================================================= */
function viewSettings(host) {
  const s = S.settings;
  const live = Store.mode === "live";
  host.innerHTML = `
    <form class="form-grid" data-sform novalidate>
      <section class="card"><header class="card__head"><h2>Store</h2></header>
        <div class="card__body form-grid"><div class="two">
          <label class="fld"><span>Store name</span><input class="inp" name="store_name" value="${esc(s.store_name)}" /></label>
          <label class="fld"><span>Brand colour</span><span class="bar"><input class="inp" type="color" name="accent" value="${esc(s.accent)}" /><small class="muted">Buttons, links and highlights on the store.</small></span></label>
        </div></div></section>

      <section class="card"><header class="card__head"><h2>Delivery & pricing</h2></header>
        <div class="card__body three">
          <label class="fld"><span>Delivery fee (KSh)</span><input class="inp" type="number" min="0" name="delivery_fee" value="${s.delivery_fee}" /></label>
          <label class="fld"><span>Free delivery from (KSh)</span><input class="inp" type="number" min="0" name="free_delivery_from" value="${s.free_delivery_from}" /><small>0 = always free</small></label>
          <label class="fld"><span>Price per storage step (KSh)</span><input class="inp" type="number" min="0" name="storage_step" value="${s.storage_step}" /><small>Added for each size above the smallest</small></label>
        </div></section>

      <section class="card"><header class="card__head"><h2>Email notifications</h2></header>
        <div class="card__body form-grid">
          <label class="fld"><span>Send new messages & orders to</span><input class="inp" type="email" name="notify_email" placeholder="you@yourstore.co.ke" value="${esc(s.notify_email)}" /></label>
          <p class="note ${live ? "" : "note--warn"}">${live
            ? "New contact messages, orders and subscribers are emailed to this address by the <code>notify</code> Edge Function. Replies from the inbox go out through <code>send-email</code>."
            : "Demo mode can't send real emails. Once you connect Supabase and deploy the Edge Functions (see <code>ADMIN.md</code>), every new message and order is emailed here, and inbox replies are sent from your store address."}</p>
          <div class="bar"><button type="button" class="btn" data-test>${I.send} Send a test email</button></div>
        </div></section>

      ${live ? "" : `<section class="card"><header class="card__head"><h2>Demo sign-in</h2></header>
        <div class="card__body two">
          <label class="fld"><span>Admin email</span><input class="inp" type="email" name="demo_admin_email" value="${esc(s.demo_admin_email)}" /></label>
          <label class="fld"><span>Admin password</span><input class="inp" type="text" name="demo_admin_password" value="${esc(s.demo_admin_password)}" /></label>
          <p class="note note--warn" style="grid-column:1/-1">Demo sign-in only protects this browser's copy. Connect Supabase before using the dashboard for a real store — then sign-in uses Supabase Auth.</p>
        </div></section>`}

      <section class="card"><header class="card__head"><h2>Data</h2></header>
        <div class="card__body form-grid">
          <div class="bar">
            <button type="button" class="btn" data-export>${I.download} Export backup (JSON)</button>
            <label class="btn">${I.upload} Import backup<input type="file" accept="application/json" data-import hidden /></label>
            ${live ? `<button type="button" class="btn" data-starter>${I.products} Load starter catalogue</button>` : `<button type="button" class="btn btn--danger" data-reset>Reset demo data</button>`}
          </div>
          <div class="note"><b>Connection:</b> ${live
            ? `Live — connected to Supabase (<code>${esc(window.IMOBILE_CONFIG.supabaseUrl)}</code>).`
            : "Demo — data is saved in this browser only. Add your Supabase URL and anon key to <code>config.js</code> to go live."}</div>
        </div></section>

      <div class="savebar"><p>Saving updates the store immediately.</p><button class="btn btn--primary" type="submit">Save settings</button></div>
    </form>`;

  const f = $("[data-sform]", host);
  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    const value = {};
    $$("input[name]", f).forEach((el) => (value[el.name] = el.type === "number" ? Number(el.value || 0) : el.value.trim()));
    try {
      await Store.saveSettings(value);
      await refresh("settings");
      document.documentElement.style.setProperty("--accent", S.settings.accent);
      toast("Settings saved");
    } catch (err) {
      toast(err.message, { bad: true });
    }
  });
  $("[data-test]", host).addEventListener("click", () => {
    const to = f.notify_email.value.trim();
    if (!to) return toast("Add a notification email first", { bad: true });
    composeEmail({ to, subject: `${s.store_name} test email`, text: "If you can read this, email from your dashboard works." }, true);
  });
  $("[data-export]", host).addEventListener("click", async () => {
    const dump = await Store.exportAll();
    download(`imobile-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(dump, null, 2));
  });
  $("[data-import]", host).addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const dump = JSON.parse(await file.text());
      if (!(await confirmBox("Import this backup?", live ? "Products, content and settings will be added/updated." : "This replaces everything in the demo.", "Import"))) return;
      await Store.importAll(dump);
      await refresh();
      render();
      toast("Backup imported");
    } catch (err) {
      toast("That file isn't a valid backup", { bad: true });
    }
  });
  $("[data-starter]", host)?.addEventListener("click", async () => {
    if (!(await confirmBox("Load the starter catalogue?", `Adds the ${DEFAULT_CATALOGUE.length} template products. Products with the same ID are overwritten.`, "Load"))) return;
    for (const [i, p] of DEFAULT_CATALOGUE.entries()) await Store.saveProduct({ visible: true, stock: 10, position: i, ...p });
    await refresh("products");
    toast(`${DEFAULT_CATALOGUE.length} products added`);
  });
  $("[data-reset]", host)?.addEventListener("click", async () => {
    if (!(await confirmBox("Reset demo data?", "Products, content and settings go back to the defaults. Orders, messages and subscribers are cleared.", "Reset"))) return;
    await Store.resetDemo();
    await refresh();
    render();
    toast("Demo data reset");
  });
}

/* ---------------- email helper ---------------- */
async function composeEmail({ to, subject, text }, direct = false) {
  if (direct) {
    try {
      await Store.sendEmail({ to, subject, text });
      toast(Store.mode === "live" ? `Email sent to ${to}` : "Opened in your email app");
    } catch (err) {
      toast(err.message, { bad: true });
    }
    return;
  }
  const d = drawer(
    "New email",
    `<form class="form-grid" data-mailf>
      <label class="fld"><span>To</span><input class="inp" name="to" type="email" required value="${esc(to)}" /></label>
      <label class="fld"><span>Subject</span><input class="inp" name="subject" required value="${esc(subject)}" /></label>
      <label class="fld"><span>Message</span><textarea class="inp" name="text" rows="10" required>${esc(text)}</textarea></label>
      <p class="note">${Store.mode === "live" ? "Sent through Resend from your store address." : "Demo mode: this opens your email app with everything filled in."}</p>
    </form>`,
    `<button class="btn" data-close>Cancel</button><button class="btn btn--primary" data-send>${I.send} Send</button>`
  );
  $("[data-send]", d).addEventListener("click", async () => {
    const f = $("[data-mailf]", d);
    if (!f.reportValidity()) return;
    try {
      await Store.sendEmail({ to: f.to.value, subject: f.subject.value, text: f.text.value });
      d.close();
      toast(Store.mode === "live" ? "Email sent" : "Opened in your email app");
    } catch (err) {
      toast(err.message, { bad: true });
    }
  });
}

/* =========================================================
   AUTH + BOOT
   ========================================================= */
async function showApp() {
  $("[data-login]").hidden = true;
  $("[data-app]").hidden = false;
  buildNav();
  const live = Store.mode === "live";
  $("[data-conn]").className = "conn" + (live ? " is-live" : "");
  $("[data-conn]").innerHTML = live
    ? "<strong>Live</strong><span>Connected to Supabase</span>"
    : "<strong>Demo mode</strong><span>Saved in this browser. See ADMIN.md to go live.</span>";
  const email = S.user?.email || "admin";
  $("[data-user]").innerHTML = `<b>${initials(email.split("@")[0].replace(/[._-]/g, " "))}</b><span>${esc(email)}</span>`;
  await refresh();
  document.documentElement.style.setProperty("--accent", S.settings.accent || "#7a3bd0");
  render();

  // new messages / orders arrive while the dashboard is open
  let seen = { m: S.messages.length, o: S.orders.length, s: S.subscribers.length };
  Store.onChange(async (ev) => {
    await refresh();
    if (S.messages.length > seen.m) toast(`New message from ${S.messages[0].name}`, { link: { href: `#/inbox/${S.messages[0].id}`, label: "Read" } });
    if (S.orders.length > seen.o) toast(`New order ${S.orders[0].number} — ${money(S.orders[0].total)}`, { link: { href: `#/orders/${S.orders[0].id}`, label: "Open" } });
    if (S.subscribers.length > seen.s) toast(`New subscriber: ${S.subscribers[0].email}`);
    seen = { m: S.messages.length, o: S.orders.length, s: S.subscribers.length };
    if (!$(".drawer")) render();
  });
}

function showLogin() {
  $("[data-app]").hidden = true;
  $("[data-login]").hidden = false;
  const live = Store.mode === "live";
  const chip = $("[data-mode-chip]");
  chip.textContent = live ? "Live" : "Demo";
  chip.classList.toggle("is-live", live);
  if (!live) {
    Store.getSettings().then((s) => {
      const hint = $("[data-demo-hint]");
      hint.hidden = false;
      hint.innerHTML = `<b>Demo mode.</b> Sign in with <b>${esc(s.demo_admin_email)}</b> / <b>${esc(s.demo_admin_password)}</b>. Change these in Settings, or connect Supabase for real accounts.`;
    });
  }
  $("[data-login-form] input").focus();
}

$("[data-login-form]").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;
  const err = $("[data-login-error]");
  err.hidden = true;
  const btn = f.querySelector("button");
  btn.disabled = true;
  try {
    S.user = await Store.signIn(f.email.value, f.password.value);
    f.reset();
    showApp();
  } catch (ex) {
    err.textContent = ex.message;
    err.hidden = false;
  } finally {
    btn.disabled = false;
  }
});

$("[data-signout]").addEventListener("click", async () => {
  await Store.signOut();
  S.user = null;
  location.hash = "";
  showLogin();
});

$("[data-menu]").addEventListener("click", () => document.body.classList.toggle("side-open"));
$("[data-scrim]").addEventListener("click", () => document.body.classList.remove("side-open"));
$("[data-view]").addEventListener("click", (e) => {
  const row = e.target.closest("tr[data-href]");
  if (row && !e.target.closest("a, button, input, label")) location.hash = row.dataset.href;
});
window.addEventListener("hashchange", () => S.user && render());

(async () => {
  S.user = await Store.getUser().catch(() => null);
  S.user ? showApp() : showLogin();
})();
