/* iMobile — product detail page (product.html?id=...) */
document.addEventListener("page:render", () => {
  const id = new URLSearchParams(location.search).get("id");
  const p = findProduct(id) || CATALOGUE[0];

  let color = 0;
  let storage = p.storage ? p.storage[0] : null;
  let qty = 1;

  document.title = `${p.name} — iMobile`;

  const isPhone = p.category === "phones";
  const catLink = $("[data-pd-cat]");
  catLink.textContent = isPhone ? "Phones" : "Accessories";
  catLink.href = isPhone ? "phones.html" : "accessories.html";
  $("[data-pd-crumb]").textContent = p.name;
  $("[data-pd-brand]").textContent = p.brand + (p.sub ? " · " + p.sub : "");
  $("[data-pd-name]").textContent = p.name;
  $("[data-pd-blurb]").textContent = p.blurb;

  // specs
  $("[data-pd-specs]").innerHTML = Object.entries(p.specs)
    .map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`)
    .join("");

  const box = {
    phone: "Phone, USB-C cable, SIM tool, quick-start guide.",
    tablet: "Tablet, USB-C cable, quick-start guide.",
    watch: "Watch, magnetic charger, extra strap size.",
    earbuds: "Earbuds, charging case, ear tips (S/M/L), USB-C cable.",
    charger: "Charger, quick-start guide.",
    cable: "Cable, velcro tie.",
    powerbank: "Power bank, USB-C cable.",
    case: "Case.",
  };
  $("[data-pd-box]").textContent = box[p.type] || "";

  // storage options (phones/tablets only)
  const storageWrap = $("[data-pd-storage-wrap]");
  if (!p.storage) storageWrap.remove();

  // storage upgrades add to the price (edit to your real pricing)
  const storageExtra = (s) => (p.storage ? p.storage.indexOf(s) * (Number(SITE.settings.storage_step) || 0) : 0);

  function renderPrice() {
    const extra = storageExtra(storage);
    $("[data-pd-price]").innerHTML =
      money(p.price + extra) + (p.was ? `<s>${money(p.was + extra)}</s>` : "");
  }

  function renderMedia() {
    $("[data-pd-main]").innerHTML = productMedia(p, color);
    $("[data-pd-color-name]").textContent = p.colors[color].name;
    $$("[data-pd-thumbs] button").forEach((b, i) => b.classList.toggle("is-active", i === color));
    $$(".swatch").forEach((b, i) => {
      b.classList.toggle("is-active", i === color);
      b.setAttribute("aria-pressed", i === color);
    });
  }

  // thumbs + swatches
  $("[data-pd-thumbs]").innerHTML = p.colors
    .map((c, i) => `<button type="button" aria-label="${c.name}">${productMedia(p, i)}</button>`)
    .join("");
  $("[data-pd-swatches]").innerHTML = p.colors
    .map((c, i) => `<button type="button" class="swatch" style="background:${c.hex}" aria-label="${c.name}" title="${c.name}"></button>`)
    .join("");

  $$("[data-pd-thumbs] button, .swatch").forEach((b) =>
    b.addEventListener("click", () => {
      color = [...b.parentElement.children].indexOf(b);
      renderMedia();
    })
  );

  if (p.storage) {
    $("[data-pd-storage]").innerHTML = p.storage
      .map((s) => `<button type="button" class="size">${s}</button>`)
      .join("");
    $$(".size").forEach((b) =>
      b.addEventListener("click", () => {
        storage = b.textContent;
        $$(".size").forEach((x) => x.classList.toggle("is-active", x === b));
        renderPrice();
      })
    );
    $(".size").classList.add("is-active");
  }

  // quantity
  const out = $("[data-qty]");
  $$("[data-step]").forEach((b) =>
    b.addEventListener("click", () => {
      qty = Math.max(1, Math.min(10, qty + Number(b.dataset.step)));
      out.textContent = qty;
    })
  );

  const addBtn = $("[data-pd-add]");
  if (p.stock === 0) {
    addBtn.disabled = true;
    addBtn.textContent = "Sold out";
  }
  addBtn.addEventListener("click", () => Cart.add(p.id, { color, storage, qty }));

  // related: same category, then anything else
  const others = CATALOGUE.filter((x) => x.id !== p.id);
  const related = [
    ...others.filter((x) => x.category !== p.category),
    ...others.filter((x) => x.category === p.category),
  ].slice(0, 4);
  $("[data-related]").innerHTML = related.map(productCard).join("");

  renderPrice();
  renderMedia();
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
});
