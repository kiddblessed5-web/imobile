/* iMobile — catalogue pages (phones, accessories, deals) */
document.addEventListener("page:render", () => {
  const grid = $("[data-shop]");
  const mode = grid.dataset.shop; // phones | accessories | deals
  const chips = $(".chips");
  const sortSel = $("[data-sort]");
  const countLabel = $("[data-count-label]");
  const params = new URLSearchParams(location.search);

  // base list for this page
  const base =
    mode === "deals"
      ? CATALOGUE.filter((p) => p.was)
      : CATALOGUE.filter((p) => p.category === mode);

  // filter options: brands for phones (+ tablets), sub-categories for accessories
  if (mode === "phones") {
    const brands = [...new Set(base.map((p) => p.brand))];
    chips.insertAdjacentHTML(
      "beforeend",
      brands.map((b) => `<button class="chip" data-filter="${b}">${b}</button>`).join("") +
        `<button class="chip" data-filter="tablets">Tablets</button>`
    );
  }
  if (mode === "accessories") {
    const subs = [...new Set(base.map((p) => p.sub))];
    chips.insertAdjacentHTML(
      "beforeend",
      subs.map((s) => `<button class="chip" data-filter="${s}">${s}</button>`).join("")
    );
  }

  let filter = params.get("sub") || params.get("brand") || "all";
  let sort = "featured";

  const matches = (p) => {
    if (filter === "all") return true;
    if (filter === "tablets") return p.type === "tablet";
    if (mode === "deals") return p.category === filter;
    return p.brand === filter || p.sub === filter;
  };

  const sorters = {
    featured: () => 0,
    low: (a, b) => a.price - b.price,
    high: (a, b) => b.price - a.price,
    name: (a, b) => a.name.localeCompare(b.name),
  };

  function render() {
    const list = base.filter(matches).sort(sorters[sort]);
    grid.innerHTML = list.length
      ? list.map(productCard).join("")
      : `<p class="empty">Nothing here yet — try another filter.</p>`;
    countLabel.textContent = `${list.length} ${list.length === 1 ? "product" : "products"}`;
    $$(".chip", chips).forEach((c) => c.classList.toggle("is-active", c.dataset.filter === filter));
    observeReveals(grid);
  }

  chips.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    filter = chip.dataset.filter;
    const url = new URL(location);
    url.searchParams.delete("sub");
    url.searchParams.delete("brand");
    if (filter !== "all") url.searchParams.set(mode === "accessories" ? "sub" : "brand", filter);
    history.replaceState(null, "", url);
    render();
  });

  sortSel.addEventListener("change", () => {
    sort = sortSel.value;
    render();
  });

  render();
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
});
