/* =========================================================
   iMobile — shared behaviour for every page
   (cursor, menu, cart, scroll reveals, hero intro)
   ========================================================= */

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

/* ---------------- CART (localStorage) ---------------- */
const Cart = {
  key: "imobile-cart",
  read() {
    try {
      return JSON.parse(localStorage.getItem(this.key)) || [];
    } catch {
      return [];
    }
  },
  write(items) {
    try {
      localStorage.setItem(this.key, JSON.stringify(items));
    } catch {}
    this.sync();
  },
  add(id, opts = {}) {
    const items = this.read();
    const color = opts.color ?? 0;
    const storage = opts.storage ?? null;
    const qty = opts.qty ?? 1;
    const line = items.find((i) => i.id === id && i.color === color && i.storage === storage);
    if (line) line.qty += qty;
    else items.push({ id, color, storage, qty });
    this.write(items);
    const p = typeof findProduct === "function" ? findProduct(id) : null;
    toast(p ? `${p.name} added to cart` : "Added to cart");
  },
  setQty(index, qty) {
    const items = this.read();
    if (!items[index]) return;
    items[index].qty = Math.max(1, Math.min(10, qty));
    this.write(items);
  },
  remove(index) {
    const items = this.read();
    items.splice(index, 1);
    this.write(items);
  },
  count() {
    return this.read().reduce((n, i) => n + i.qty, 0);
  },
  sync() {
    const n = this.count();
    $$(".nav__count").forEach((el) => {
      el.textContent = n;
      el.classList.remove("bump");
      void el.offsetWidth;
      el.classList.add("bump");
    });
    document.dispatchEvent(new CustomEvent("cart:change"));
  },
};

/* ---------------- TOAST ---------------- */
function toast(message, showCartLink = true) {
  let el = $(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    document.body.append(el);
  }
  el.innerHTML = `<span>${message}</span>${showCartLink ? '<a href="cart.html">View cart</a>' : ""}`;
  el.classList.add("is-shown");
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.remove("is-shown"), 2600);
}

/* add-to-cart buttons anywhere on the page */
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-add]");
  if (!btn) return;
  e.preventDefault();
  Cart.add(btn.dataset.add);
});

/* ---------------- MENU ---------------- */
const menuBtn = $(".nav__menu");
const menu = $(".menu");

function setMenu(open) {
  document.body.classList.toggle("menu-open", open);
  menuBtn?.setAttribute("aria-expanded", open);
  menuBtn?.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  menu?.setAttribute("aria-hidden", !open);
}

menuBtn?.addEventListener("click", () =>
  setMenu(!document.body.classList.contains("menu-open"))
);
$$(".menu a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") setMenu(false);
});

/* ---------------- NAV ON SCROLL ---------------- */
const onScroll = () => document.body.classList.toggle("scrolled", window.scrollY > 40);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ---------------- CUSTOM CURSOR ---------------- */
const cursor = $(".cursor");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

if (cursor && finePointer.matches) {
  const dot = $(".cursor__dot");
  const ring = $(".cursor__ring");
  document.documentElement.classList.add("has-cursor");

  let mx = -100, my = -100, rx = -100, ry = -100;

  window.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px)`;
    cursor.classList.add("is-visible");
  });

  (function follow() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(follow);
  })();

  document.addEventListener("mouseover", (e) => {
    cursor.classList.toggle(
      "is-hover",
      !!e.target.closest("a, button, select, label, input[type=range], .swatch")
    );
  });
  document.documentElement.addEventListener("mouseleave", () =>
    cursor.classList.remove("is-visible")
  );
  window.addEventListener("mousedown", () => cursor.classList.add("is-down"));
  window.addEventListener("mouseup", () => cursor.classList.remove("is-down"));
}

/* ---------------- SCROLL REVEALS ---------------- */
const io = new IntersectionObserver(
  (entries) =>
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add("is-in");
        io.unobserve(en.target);
      }
    }),
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);

function observeReveals(root = document) {
  $$("[data-reveal]", root).forEach((el, i) => {
    if (el.classList.contains("reveal")) return;
    el.classList.add("reveal");
    el.style.transitionDelay = `${(Number(el.dataset.reveal) || 0) * 90}ms`;
    io.observe(el);
  });
}

/* ---------------- COUNT-UP ---------------- */
function countUp(el) {
  const target = Number(el.dataset.count);
  const start = performance.now();
  const duration = 1600;
  const tick = (now) => {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ---------------- COUNTDOWN (weekend deals) ---------------- */
function nextSundayMidnight() {
  // the coming Sunday at 23:59:59 (today, if today is Sunday)
  const end = new Date();
  end.setDate(end.getDate() + ((7 - end.getDay()) % 7));
  end.setHours(23, 59, 59, 0);
  return end;
}

function startCountdowns() {
  const boxes = $$("[data-countdown]");
  if (!boxes.length) return;
  const end = nextSundayMidnight();
  const pad = (n) => String(n).padStart(2, "0");
  const tick = () => {
    let s = Math.max(0, Math.floor((end - new Date()) / 1000));
    const d = Math.floor(s / 86400); s -= d * 86400;
    const h = Math.floor(s / 3600); s -= h * 3600;
    const m = Math.floor(s / 60); s -= m * 60;
    boxes.forEach((box) => {
      box.querySelector("[data-d]").textContent = pad(d);
      box.querySelector("[data-h]").textContent = pad(h);
      box.querySelector("[data-m]").textContent = pad(m);
      box.querySelector("[data-s]").textContent = pad(s);
    });
  };
  tick();
  setInterval(tick, 1000);
}

/* ---------------- CARDS (shared) ---------------- */
const ICON_ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>';
const ICON_PLUS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';

function productCard(p, i = 0) {
  const off = discount(p);
  return `
    <article class="pcard" data-reveal="${i % 4}">
      <div class="pcard__media cut">
        <a href="product.html?id=${p.id}" class="pcard__link" aria-label="${p.name}"></a>
        ${p.tag ? `<span class="badge">${p.tag}</span>` : ""}
        ${off ? `<span class="badge">−${off}%</span>` : ""}
        <div class="pcard__art">${productMedia(p)}</div>
        <span class="cut__notch"><span class="pcard__tagprice">${money(p.price)}</span></span>
        <button class="pcard__buy" data-add="${p.id}" aria-label="Add ${p.name} to cart">
          ${ICON_PLUS} Add to cart
        </button>
      </div>
      <h3 class="pcard__name"><a href="product.html?id=${p.id}">${p.name}</a></h3>
      <div class="pcard__meta">
        <span>${p.was ? `<s>${money(p.was)}</s>` : p.brand + (p.sub ? " · " + p.sub : "")}</span>
        <ul class="dots" aria-label="${p.colors.length} colours">
          ${p.colors.map((c) => `<li style="background:${c.hex}" title="${c.name}"></li>`).join("")}
        </ul>
      </div>
    </article>`;
}

function promoCard({ title, text, href, label, img }, i = 3) {
  return `
    <a href="${href}" class="promo cut" data-reveal="${i}"${img ? ` style="--img:url('${img}')"` : ""}>
      <span class="cut__notch"><span class="chip-go">${ICON_ARROW}</span></span>
      <h3>${title}</h3>
      <p>${text}</p>
      <span class="button button--light">${label}</span>
    </a>`;
}

/* ---------------- HERO (home page only) ---------------- */
const bg = $(".hero__bg");
const desktop = window.matchMedia("(min-width: 761px)");

if (bg) {
  window.addEventListener("mousemove", (e) => {
    if (!desktop.matches || window.scrollY > window.innerHeight) return;
    const x = (e.clientX / window.innerWidth - 0.5) * -14;
    const y = (e.clientY / window.innerHeight - 0.5) * -8;
    bg.style.translate = `${x}px ${y}px`;
  });
}

const heroSequence = [
  ".nav",
  ".hero__lede",
  ".hero__word",
  ".hero__stat",
  ".hero__shop",
]
  .map((s) => $(".screen " + s))
  .filter(Boolean);

heroSequence.forEach((el) => el.classList.add("reveal"));

/* active nav link from the current file name */
const page = location.pathname.split("/").pop() || "index.html";
$$(".nav__links a, .menu a").forEach((a) => {
  const target = a.getAttribute("href");
  a.classList.toggle("is-active", target === page || (page === "" && target === "index.html"));
  if (target === page) a.setAttribute("aria-current", "page");
});

/* ---------------- INIT ---------------- */
function init() {
  heroSequence.forEach((el, i) =>
    setTimeout(() => el.classList.add("is-in"), 100 + i * 110)
  );
  setTimeout(() => $$("[data-count]").forEach(countUp), 800);
  observeReveals();
  startCountdowns();
  Cart.sync();
}

/* ---------------- SMOOTH SCROLL (Lenis, with native fallback) ---------------- */
let lenis = null;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (window.Lenis && !reduceMotion) {
  lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
  const raf = (t) => {
    lenis.raf(t);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  // in-page anchor links glide too
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute("href").length < 2) return;
    const target = document.querySelector(a.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: -80 });
  });

  // pause page scroll while the menu is open
  new MutationObserver(() =>
    document.body.classList.contains("menu-open") ? lenis.stop() : lenis.start()
  ).observe(document.body, { attributes: true, attributeFilter: ["class"] });
}

/* ---------------- CONTACT FORM (front-end only) ---------------- */
document.addEventListener("submit", (e) => {
  const form = e.target.closest("[data-contact]");
  if (!form) return;
  e.preventDefault();
  let ok = true;
  $$("[required]", form).forEach((f) => {
    const bad = !f.value.trim() || (f.type === "email" && !/^\S+@\S+\.\S+$/.test(f.value));
    f.classList.toggle("is-invalid", bad);
    if (bad) ok = false;
  });
  if (!ok) {
    toast("Please fill in your name, email and message", false);
    return;
  }
  // connect this to your email service / backend (Formspree, Supabase, etc.)
  form.reset();
  toast("Thanks — your message has been sent", false);
});

/* ---------------- PRELOADER ---------------- */
const preloader = $(".preloader");

function runPreloader() {
  return new Promise((resolve) => {
    if (!preloader) return resolve();
    let first = true;
    try {
      first = !sessionStorage.getItem("imobile-loaded");
      sessionStorage.setItem("imobile-loaded", "1");
    } catch {}
    const duration = reduceMotion ? 200 : first ? 1500 : 550;
    const bar = $("[data-pre-bar]");
    const count = $("[data-pre-count]");
    const start = performance.now();
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    let fontsDone = false;
    fontsReady.then(() => (fontsDone = true));

    const tick = (now) => {
      let p = Math.min((now - start) / duration, 1);
      if (!fontsDone && p > 0.9) p = 0.9; // wait at 90% until fonts are in
      const eased = 1 - Math.pow(1 - p, 3);
      bar.style.width = `${eased * 100}%`;
      count.textContent = Math.round(eased * 100);
      if (p < 1) requestAnimationFrame(tick);
      else setTimeout(resolve, 120);
    };
    requestAnimationFrame(tick);
    // never wait more than 4s
    setTimeout(resolve, 4000);
  });
}

if (preloader) document.body.classList.add("is-loading");

let started = false;
function start() {
  if (started) return;
  started = true;
  document.body.classList.remove("is-loading");
  document.body.classList.add("loaded");
  setTimeout(init, preloader ? 350 : 0);
}

document.addEventListener("DOMContentLoaded", () => {
  document.dispatchEvent(new Event("page:render"));
  runPreloader().then(start);
});
