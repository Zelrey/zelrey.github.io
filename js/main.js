/* =========================================================
   Zelrey — Portfolio · main (page routing + mobile nav)
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
})();
