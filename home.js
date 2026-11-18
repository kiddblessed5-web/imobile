/* iMobile — home page sections */
document.addEventListener("page:render", () => {
  /* ---------- Hero: featured product + brand count ---------- */
  const mini = $("[data-hero-product]");
  if (mini) {
    const hp = findProduct(mini.dataset.heroProduct);
    if (hp) {
      $("[data-mini-art]", mini).innerHTML = productMedia(hp, 0);
      $("[data-mini-name]", mini).textContent = hp.name;
      $("[data-mini-buy]", mini).lastChild.textContent = ` Buy ${money(hp.price)}`;
    }
  }
  const brandCount = $("[data-brand-count]");
  if (brandCount) brandCount.dataset.count = new Set(CATALOGUE.map((p) => p.brand)).size;

  // device artwork in category cards
  $$("[data-art]").forEach((el) => {
    el.innerHTML = deviceArt(el.dataset.art, el.dataset.color);
  });

  /* ---------- Featured categories: arrow buttons ---------- */
  const row = $("[data-crow]");
  const prev = $("[data-crow-prev]");
  const next = $("[data-crow-next]");
  const step = () => row.firstElementChild.getBoundingClientRect().width + 14;
  const updateArrows = () => {
    prev.disabled = row.scrollLeft < 4;
    next.disabled = row.scrollLeft + row.clientWidth >= row.scrollWidth - 4;
  };
  prev.addEventListener("click", () => row.scrollBy({ left: -step() }));
  next.addEventListener("click", () => row.scrollBy({ left: step() }));
  row.addEventListener("scroll", updateArrows, { passive: true });
  window.addEventListener("resize", updateArrows);
  updateArrows();

  /* ---------- Hot picks: tabs ---------- */
  const picks = $("[data-picks]");
  const groups = {
    phones: {
      items: CATALOGUE.filter((p) => p.category === "phones"),
      promo: { title: (n) => `Explore all ${n} phones & tablets`, text: "Flagships, foldables and tablets.", href: "phones.html", label: "View collection", img: "assets/img/phones-teal.jpg" },
    },
    audio: {
      items: CATALOGUE.filter((p) => ["Smartwatches", "Earbuds"].includes(p.sub)),
      promo: { title: (n) => `Explore all ${n} watches & earbuds`, text: "Track, listen and stay connected.", href: "accessories.html?sub=Smartwatches", label: "View collection", img: "assets/img/headphones-black.jpg" },
    },
    power: {
      items: CATALOGUE.filter((p) => ["Power Banks", "Chargers & Cables", "Cases"].includes(p.sub)),
      promo: { title: (n) => `Explore all ${n} power & protection picks`, text: "Chargers, power banks and cases.", href: "accessories.html", label: "View collection", img: "assets/img/case-portrait.jpg" },
    },
  };

  function showPicks(key, instant = true) {
    const g = groups[key];
    // tagged items first
    const items = [...g.items].sort((a, b) => !!b.tag - !!a.tag).slice(0, 4);
    picks.innerHTML =
      items.map(productCard).join("") +
      promoCard({ ...g.promo, title: g.promo.title(g.items.length) });
    observeReveals(picks);
    // when switching tabs, reveal straight away instead of waiting for scroll
    if (instant) requestAnimationFrame(() => $$(".reveal", picks).forEach((el) => el.classList.add("is-in")));
  }

  $$(".tabs [data-tab]").forEach((tab) =>
    tab.addEventListener("click", () => {
      $$(".tabs [data-tab]").forEach((t) => {
        const on = t === tab;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", on);
      });
      showPicks(tab.dataset.tab);
    })
  );
  showPicks("phones", false);

  /* ---------- Weekend deals: two biggest discounts ---------- */
  const deals = CATALOGUE.filter((p) => p.was)
    .sort((a, b) => discount(b) - discount(a))
    .slice(0, 2);
  $("[data-home-deals]").innerHTML = deals.map(productCard).join("");

  /* ---------- Newsletter (front-end only — connect your email tool) ---------- */
  $("[data-newsletter]")?.addEventListener("submit", (e) => {
    e.preventDefault();
    e.target.reset();
    toast("Thanks — you're on the list", false);
  });

  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
});
