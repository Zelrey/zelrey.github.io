/* =========================================================
   Zelrey — Portfolio · main (page routing + mobile nav + button spring)
   ========================================================= */

(function () {
  "use strict";

  const PAGES = ["home", "projects", "art", "info"];
  const pages = document.querySelectorAll(".page");
  const navLinks = document.querySelectorAll("[data-nav]");
  const navCenter = document.querySelector(".nav-center");
  const navToggle = document.querySelector(".nav-toggle");

  function showPage(id) {
    const target = id || "home";
    pages.forEach((page) => {
      page.classList.toggle("active", page.id === `page-${target}`);
    });
    document.body.classList.toggle("theme-light", target === "projects");
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("data-nav") === target);
    });
    if (navCenter) navCenter.classList.remove("open");
    window.scrollTo({ top: 0, behavior: "auto" });

    // Trigger masonry resize for Art
    window.dispatchEvent(new Event("resize"));
    window.dispatchEvent(new Event("resize"));
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
      if (typeof resizeArtItems === "function") resizeArtItems();
    }, 40);
    setTimeout(() => window.dispatchEvent(new Event("resize")), 180);

    if (history.replaceState) {
      history.replaceState(null, "", `#${target}`);
    } else {
      location.hash = target;
    }
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      showPage(link.getAttribute("data-nav"));
    });
  });

  const initial = (location.hash || "#home").replace("#", "") || "home";
  showPage(PAGES.includes(initial) ? initial : "home");

  window.addEventListener("hashchange", () => {
    const h = (location.hash || "#home").replace("#", "");
    if (PAGES.includes(h)) showPage(h);
  });

  if (navToggle && navCenter) {
    navToggle.addEventListener("click", () => {
      navCenter.classList.toggle("open");
    });
  }

  /* ----- Sable Proximity Spring Motion on Navigation ----- */
  (function initNavSpring() {
    const nav = document.querySelector(".nav-center");
    if (!nav) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover:hover) and (pointer:fine)");
    const canAnimate = () => !reducedMotion.matches && finePointer.matches && window.innerWidth > 768;

    const items = Array.from(nav.querySelectorAll(".nav-link")).map((el) => ({
      el,
      value: 0,
      velocity: 0,
      target: 0,
    }));

    const options = { proximity: 122, spring: 0.19, damping: 0.70, drop: 3.5 };
    let active = false;
    let dirty = false;

    function setTargets(clientX) {
      if (!canAnimate()) return;
      const rects = items.map((s) => s.el.getBoundingClientRect());
      for (let i = 0; i < items.length; i++) {
        const center = rects[i].left + rects[i].width * 0.5;
        const dist = Math.abs(clientX - center);
        const p = Math.max(0, Math.min(1, 1 - dist / options.proximity));
        items[i].target = p * p * (3 - 2 * p);
      }
      active = true;
      dirty = true;
    }

    function reset() {
      active = false;
      dirty = true;
      items.forEach((s) => { s.target = 0; });
    }

    function loop() {
      if (!dirty || !canAnimate()) {
        frame = 0;
        return;
      }
      let moving = false;
      items.forEach((s) => {
        s.velocity += (s.target - s.value) * options.spring;
        s.velocity *= options.damping;
        s.value += s.velocity;
        if (Math.abs(s.target - s.value) < 0.001 && Math.abs(s.velocity) < 0.001) {
          s.value = s.target;
          s.velocity = 0;
        } else {
          moving = true;
        }
        const v = Math.max(0, Math.min(1.08, s.value));
        s.el.style.transform = `translateY(${(v * options.drop).toFixed(2)}px)`;
      });
      if (!moving && !active) {
        dirty = false;
        frame = 0;
        return;
      }
      frame = requestAnimationFrame(loop);
    }

    function startLoop() {
      dirty = true;
      if (!frame) frame = requestAnimationFrame(loop);
    }

    nav.addEventListener("pointerenter", startLoop);
    nav.addEventListener("pointermove", (e) => {
      setTargets(e.clientX);
      startLoop();
    });
    nav.addEventListener("pointerleave", () => {
      reset();
      startLoop();
    });
  })();

  /* ----- Liquid Metal Button postMessage bridge ----- */
  window.addEventListener("message", (e) => {
    if (e.data && e.data.liquidMetalButton && e.data.liquidMetalButton.type === "activate") {
      const modal = document.getElementById("modal-contact");
      if (modal) {
        modal.classList.add("open");
        document.body.style.overflow = "hidden";
      }
    }
  });

})();
