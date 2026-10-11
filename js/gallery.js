/* =========================================================
   Zelrey — Portfolio · Gallery (lightbox + hero parallax + reveal)
   ========================================================= */

(function () {
  "use strict";

  /* ----- Lightbox ----- */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = lightbox ? lightbox.querySelector("img") : null;

  function openLightbox(src, alt) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
  }

  document.querySelectorAll("[data-lightbox]").forEach((el) => {
    el.addEventListener("click", () => {
      const img = el.querySelector("img") || el;
      openLightbox(img.currentSrc || img.src, img.alt);
    });
  });

  if (lightbox) {
    lightbox.addEventListener("click", closeLightbox);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });

  /* ----- Hero soft parallax ----- */
  const heroBg = document.querySelector(".hero-bg img");
  if (heroBg) {
    window.addEventListener(
      "scroll",
      () => {
        if (!document.getElementById("page-home")?.classList.contains("active")) return;
        heroBg.style.transform = `scale(1.05) translate3d(0, ${window.scrollY * 0.12}px, 0)`;
      },
      { passive: true }
    );
  }

  /* ----- Reveal on scroll (projects / art / jobs) ----- */
  const revealEls = document.querySelectorAll(".project-item, .art-item, .job");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.transition = "opacity 0.55s cubic-bezier(0.22,1,0.36,1), transform 0.55s cubic-bezier(0.22,1,0.36,1)";
            entry.target.style.opacity = "1";
            entry.target.style.transform = "none";
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    revealEls.forEach((el, i) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(18px)";
      el.style.transitionDelay = `${(i % 6) * 0.05}s`;
      io.observe(el);
    });
  }

  /* ----- Art Masonry tight auto-rows (guaranteed 0 gap on top) ----- */
  function resizeArtItems() {
    const grid = document.querySelector(".art-masonry");
    if (!grid) return;
    const colWidth = (grid.clientWidth - 21) / 4;
    if (colWidth <= 10) return;

    const rowHeight = 2;
    const gap = 7;
    const items = grid.querySelectorAll(".art-item");

    items.forEach((item) => {
      let h = 0;
      if (item.classList.contains("art-item-span2")) {
        // Video spans 2 columns + 1 gap
        const span2Width = colWidth * 2 + gap;
        h = span2Width; // 1:1 square
      } else {
        const img = item.querySelector("img");
        if (img) {
          if (img.naturalWidth && img.naturalHeight) {
            h = (colWidth * img.naturalHeight) / img.naturalWidth;
          } else if (img.getAttribute("width") && img.getAttribute("height")) {
            const w = parseFloat(img.getAttribute("width"));
            const ah = parseFloat(img.getAttribute("height"));
            h = (colWidth * ah) / w;
          } else {
            h = img.getBoundingClientRect().height || colWidth;
          }
        }
      }

      if (h > 0) {
        const rowSpan = Math.round((h + gap) / rowHeight);
        item.style.gridRowEnd = "span " + rowSpan;
      }
    });
  }

  window.addEventListener("load", resizeArtItems);
  window.addEventListener("resize", resizeArtItems);
  document.addEventListener("DOMContentLoaded", resizeArtItems);
  document.querySelectorAll(".art-item img, .art-item video").forEach((el) => {
    el.addEventListener("load", resizeArtItems);
    el.addEventListener("loadedmetadata", resizeArtItems);
  });
  [50, 150, 400, 1000].forEach((t) => setTimeout(resizeArtItems, t));

})();
