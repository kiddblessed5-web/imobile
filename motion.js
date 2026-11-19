/* =========================================================
   iMobile — motion (GSAP + ScrollTrigger + SplitText + Lenis)

   • Preloader: logo mark pops in, "iMobile" rises letter by letter,
     then a grid of strips sweeps away to reveal the page.
   • Page transitions: the strips sweep back in before leaving a page.
   • Scroll: split headings, staggered cards, parallax photos,
     hero zoom-out, footer wordmark rise, marquee that reacts to scroll,
     magnetic buttons.
   Falls back to the plain CSS version if GSAP is missing or the
   visitor prefers reduced motion.
   ========================================================= */
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const on = !!(window.gsap && window.ScrollTrigger) && !reduce;
  const M = { on, lenis: null };
  window.Motion = M;
  document.documentElement.classList.add(on ? "has-motion" : "no-motion");
  if (!on) return;

  const hasSplit = !!window.SplitText;
  gsap.registerPlugin(ScrollTrigger, ...(hasSplit ? [SplitText] : []));
  gsap.defaults({ ease: "power3.out" });

  const q = (s, r = document) => r.querySelector(s);
  const qa = (s, r = document) => [...r.querySelectorAll(s)];
  const mobile = () => window.innerWidth < 761;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------------- loader grid ---------------- */
  const loader = q(".loader");
  const grid = loader && q(".loader__grid", loader);
  const brand = loader && q(".loader__brand", loader);
  const ROWS = 4;
  let COLS = 0;
  let cells = [];

  function buildGrid() {
    if (!grid) return;
    COLS = mobile() ? 6 : 14;
    grid.style.setProperty("--cols", COLS);
    grid.innerHTML = "<i></i>".repeat(COLS * ROWS);
    cells = [...grid.children];
  }
  buildGrid();

  // each row sweeps a little out of step, like the reference
  const rowOffset = [0.14, 0, 0.22, 0.07];
  const sweepDelay = (reverse) => (i) => {
    const row = Math.floor(i / COLS);
    const col = i % COLS;
    const c = reverse ? col : COLS - 1 - col;
    return c * (mobile() ? 0.05 : 0.03) + rowOffset[row % 4];
  };

  let fromNav = false;
  try {
    fromNav = sessionStorage.getItem("imobile-nav") === "1";
    sessionStorage.removeItem("imobile-nav");
  } catch {}

  /* ---------------- 1. preload (logo intro) ---------------- */
  M.preload = () =>
    new Promise((resolve) => {
      if (!loader) return resolve();
      let first = true;
      try {
        first = !sessionStorage.getItem("imobile-loaded");
        sessionStorage.setItem("imobile-loaded", "1");
      } catch {}

      const count = q("[data-pre-count]", loader);
      const counter = { v: 0 };
      const letters = qa(".loader__word > span", loader);
      const tl = gsap.timeline();

      if (fromNav) {
        // arriving from a page transition: screen is already covered
        gsap.set([brand, ".loader__tag", ".loader__count"], { autoAlpha: 0 });
        tl.to({}, { duration: 0.15 });
      } else if (first) {
        tl.from(".loader__mark", { scale: 0, rotate: -120, duration: 0.8, ease: "back.out(1.8)" })
          .from(letters, { yPercent: 115, duration: 0.7, stagger: 0.06, ease: "power4.out" }, "-=0.35")
          .from([".loader__tag", ".loader__count"], { autoAlpha: 0, y: 10, duration: 0.5 }, 0.2)
          .to(counter, {
            v: 100, duration: 1.7, ease: "power2.inOut",
            onUpdate: () => (count.textContent = Math.round(counter.v)),
          }, 0)
          .to({}, { duration: 0.15 });
      } else {
        // repeat visit in this session: just the strip sweep, no logo
        gsap.set([brand, ".loader__tag", ".loader__count"], { autoAlpha: 0 });
        tl.to({}, { duration: 0.1 });
      }

      const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
      const fontsOrTimeout = Promise.race([fonts, new Promise((r) => setTimeout(r, 2500))]);
      Promise.all([tl.then(), fontsOrTimeout]).then(resolve);
      setTimeout(resolve, 5000); // never hang
    });

  /* ---------------- 2. enter (strips sweep away + page intro) ---------------- */
  M.enter = () => {
    if (!loader) {
      pageIntro(gsap.timeline());
      return;
    }
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(loader, { display: "none" });
        ScrollTrigger.refresh();
      },
    });
    tl.to(brand, { autoAlpha: 0, y: -24, duration: 0.45, ease: "power2.in" })
      .to([".loader__tag", ".loader__count"], { autoAlpha: 0, duration: 0.3 }, "<")
      .to(cells, {
        scaleX: 0, transformOrigin: "0% 50%", duration: 0.75, ease: "power3.inOut",
        stagger: sweepDelay(false),
      }, "-=0.15");
    pageIntro(tl, "-=0.65");
  };

  /* hero / page-specific intro, joined onto the loader timeline */
  function pageIntro(tl, at = 0) {
    const screen = q(".screen");
    if (!screen) {
      if (!fromNav) tl.from(".nav", { y: -30, autoAlpha: 0, duration: 0.8 }, at);
      return;
    }
    const word = q(".hero__word h1");
    let chars = [word];
    if (hasSplit && word) chars = SplitText.create(word, { type: "chars", charsClass: "hc" }).chars;

    tl.addLabel("intro", at)
      .from(".hero__bg", { scale: 1.3, duration: 1.8, ease: "expo.out" }, "intro")
      .from(".nav__left, .nav__right", { y: -40, autoAlpha: 0, duration: 0.9, stagger: 0.08 }, "intro")
      .from(chars, {
        yPercent: 60, autoAlpha: 0, filter: "blur(14px)", duration: 1.1, stagger: 0.05, ease: "power4.out",
        clearProps: "filter",
      }, "intro+=0.15")
      .from(".hero__word > span", { x: -24, autoAlpha: 0, duration: 0.8 }, "-=0.6")
      .from(".hero__lede", { y: 24, autoAlpha: 0, duration: 0.8 }, "<")
      .from(".hero__stat", { y: 30, autoAlpha: 0, duration: 0.8 }, "<0.1")
      .from(".hero__shop", { y: 60, autoAlpha: 0, duration: 0.9, ease: "expo.out" }, "<0.1")
      .from(".mini__art", { rotate: -25, scale: 0.6, duration: 1.1, ease: "back.out(1.6)" }, "<0.1")
      .from(".marquee", { autoAlpha: 0, y: 20, duration: 0.7 }, "<");
  }

  /* ---------------- 3. page transitions ---------------- */
  function leaveTo(href) {
    if (!loader) return (location.href = href);
    gsap.killTweensOf(cells);
    gsap.set(loader, { display: "block" });
    gsap.set([brand, ".loader__tag", ".loader__count"], { autoAlpha: 0 });
    gsap.set(cells, { scaleX: 0, transformOrigin: "100% 50%" });
    document.body.classList.add("is-leaving");
    gsap.to(cells, {
      scaleX: 1, duration: 0.55, ease: "power3.inOut", stagger: sweepDelay(true),
      onComplete: () => {
        try { sessionStorage.setItem("imobile-nav", "1"); } catch {}
        location.href = href;
      },
    });
  }

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target === "_blank" || a.hasAttribute("download") || a.closest("[data-add]")) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || /^(mailto|tel|javascript|whatsapp):/i.test(href)) return;
    const url = new URL(href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.search === location.search) return;
    if (!/\.html$|\/$/.test(url.pathname)) return;
    e.preventDefault();
    leaveTo(url.href);
  });

  // coming back with the browser's back button: never leave the cover up
  window.addEventListener("pageshow", (e) => {
    if (e.persisted && loader) {
      gsap.set(cells, { scaleX: 0 });
      gsap.set(loader, { display: "none" });
      document.body.classList.remove("is-leaving");
    }
  });

  /* ---------------- 4. smooth scroll ---------------- */
  M.bindLenis = (lenis) => {
    M.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  };

  /* ---------------- 5. scroll reveals ---------------- */
  const HEADINGS = ".stitle, .phead__title, .pd__name, .connect h2, .cart-empty .h2, .done .stitle";

  M.reveals = (root = document) => {
    const els = qa("[data-reveal]", root).filter((el) => !el._mv && !el.matches(HEADINGS));
    els.forEach((el) => (el._mv = true));
    if (!els.length) return;
    const from = (el) =>
      el.matches(".ccard") ? { x: 90, y: 0, rotate: 3 }
      : el.matches(".pcard, .tcard, .promo") ? { y: 70, scale: 0.96 }
      : { y: 40 };
    els.forEach((el) => gsap.set(el, { autoAlpha: 0, ...from(el) }));
    ScrollTrigger.batch(els, {
      start: "top 92%",
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          autoAlpha: 1, x: 0, y: 0, rotate: 0, scale: 1, duration: 1, stagger: 0.09,
          ease: "power3.out", overwrite: "auto", clearProps: "transform",
        }),
    });
    splitHeadings(root);
  };

  function splitHeadings(root) {
    qa(HEADINGS, root).forEach((h) => {
      if (h._ms) return;
      h._ms = true;
      if (!hasSplit) {
        gsap.from(h, { y: 30, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: h, start: "top 92%", once: true } });
        return;
      }
      SplitText.create(h, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 110, duration: 1.05, stagger: 0.1, ease: "power4.out",
            scrollTrigger: { trigger: h, start: "top 92%", once: true },
          }),
      });
    });
  }

  /* ---------------- 6. everything that scrubs with scroll ---------------- */
  M.scroll = () => {
    const mm = gsap.matchMedia();

    // hero: photo drifts and the panel eases back as you scroll away
    if (q(".screen")) {
      gsap.to(".hero__bg", {
        yPercent: 10, scale: 1.08, ease: "none",
        scrollTrigger: { trigger: ".screen", start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".hero__word", {
        yPercent: -35, ease: "none",
        scrollTrigger: { trigger: ".screen", start: "top top", end: "bottom top", scrub: true },
      });
      mm.add("(min-width: 761px)", () => {
        gsap.to(".hero", {
          scale: 0.94, transformOrigin: "50% 100%", ease: "none",
          scrollTrigger: { trigger: ".screen", start: "top top", end: "bottom top", scrub: true },
        });
      });
    }

    // photos: open up from a smaller window, then drift inside it
    qa(".why__photo, .banner, .tcard__photo, .connect").forEach((el) => {
      gsap.fromTo(el, { clipPath: "inset(14% 10% 14% 10% round 5px)" }, {
        clipPath: "inset(0% 0% 0% 0% round 5px)", duration: 1.4, ease: "expo.out",
        clearProps: "clipPath", // never leave the photo (or its label) cropped
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
      if (!el.matches(".connect")) {
        gsap.fromTo(el, { backgroundPositionY: "30%" }, {
          backgroundPositionY: "70%", ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        });
      }
    });

    // product art bobs gently as cards pass through the screen
    qa(".deals-band, .testi").forEach((sec) =>
      gsap.from(qa(".countdown > div, .stars svg", sec), {
        y: 20, autoAlpha: 0, duration: 0.6, stagger: 0.05, ease: "back.out(2)",
        scrollTrigger: { trigger: sec, start: "top 80%", once: true },
      })
    );

    // why list: numbers count in, rows slide
    qa(".why__item").forEach((row) =>
      gsap.from(q(".why__num", row), {
        x: -20, autoAlpha: 0, duration: 0.6,
        scrollTrigger: { trigger: row, start: "top 88%", once: true },
      })
    );

    // footer: giant wordmark rises letter by letter
    const fw = q(".footer__word");
    if (fw) {
      const chars = hasSplit ? SplitText.create(fw, { type: "chars" }).chars : [fw];
      gsap.from(chars, {
        yPercent: 100, stagger: 0.06, ease: "none",
        scrollTrigger: { trigger: ".footer", start: "top 85%", end: "bottom bottom", scrub: 1 },
      });
    }

    // marquee (phones): GSAP loop that speeds up with scroll velocity
    const track = q(".marquee__track");
    if (track && getComputedStyle(q(".marquee")).display !== "none") {
      track.style.animation = "none";
      const loop = gsap.to(track, { xPercent: -50, duration: 26, ease: "none", repeat: -1 });
      ScrollTrigger.create({
        onUpdate: (self) => {
          const v = Math.min(Math.abs(self.getVelocity()) / 250, 5);
          gsap.to(loop, { timeScale: (self.direction || 1) * (1 + v), duration: 0.2, overwrite: true });
          gsap.to(loop, { timeScale: self.direction || 1, duration: 1.2, delay: 0.25, overwrite: false });
        },
      });
    }

    // magnetic buttons (mouse only)
    if (finePointer) {
      qa(".btn, .btn-square, .nav__cta, .button:not(.button--block), .socials a, .footer__social a, .chip-go").forEach((el) => {
        const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
        el.addEventListener("mousemove", (e) => {
          const r = el.getBoundingClientRect();
          xTo((e.clientX - r.left - r.width / 2) * 0.25);
          yTo((e.clientY - r.top - r.height / 2) * 0.35);
        });
        el.addEventListener("mouseleave", () => {
          gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.4)" });
        });
      });
    }

    // product page: gallery slides in from the side
    if (q(".pd")) {
      gsap.from(".pd__main", { x: -60, autoAlpha: 0, duration: 1.1, ease: "expo.out", delay: 0.2 });
      gsap.from(".pd__thumbs button", { y: 20, autoAlpha: 0, duration: 0.6, stagger: 0.06, delay: 0.5 });
      gsap.from(".pd__info > *:not(.pd__name)", { y: 26, autoAlpha: 0, duration: 0.8, stagger: 0.05, delay: 0.3 });
    }

    window.addEventListener("load", () => ScrollTrigger.refresh());
  };
})();
