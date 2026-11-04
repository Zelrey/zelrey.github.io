/* =========================================================
   Zelrey — Portfolio · Gallery (lightbox + hero parallax + reveal)
   ========================================================= */

(function () {
  "use strict";

  /* ----- Lightbox with Image & Video Zoom Support ----- */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxVideo = document.getElementById("lightbox-video");
  const lightboxTitle = document.getElementById("lightbox-title");
  const lightboxDesc = document.getElementById("lightbox-desc");
  const lightboxClose = document.getElementById("lightbox-close");

  const lightboxAward = document.getElementById("lightbox-award");
  const lightboxCredits = document.getElementById("lightbox-credits");
  const lightboxTools = document.getElementById("lightbox-tools");
  const boxCredits = document.getElementById("box-credits");
  const boxTools = document.getElementById("box-tools");
  const metaGrid = document.getElementById("lightbox-meta-grid");

  function openLightbox(mediaSrc, isVideo, title, desc, credits, tools, award) {
    if (!lightbox) return;

    if (isVideo && lightboxVideo) {
      if (lightboxImg) lightboxImg.style.display = "none";
      const source = lightboxVideo.querySelector("source");
      if (source) source.src = mediaSrc;
      lightboxVideo.src = mediaSrc;
      lightboxVideo.style.display = "block";
      lightboxVideo.play().catch(() => {});
    } else if (lightboxImg) {
      if (lightboxVideo) {
        lightboxVideo.pause();
        lightboxVideo.style.display = "none";
      }
      lightboxImg.src = mediaSrc;
      lightboxImg.alt = title || "Artwork";
      lightboxImg.style.display = "block";
    }

    if (lightboxTitle) lightboxTitle.textContent = title || "";
    if (lightboxDesc) lightboxDesc.textContent = desc || "";

    // Awards badge (shown only when provided, e.g. for projects)
    if (lightboxAward) {
      if (award) {
        lightboxAward.textContent = `★ ${award}`;
        lightboxAward.style.display = "inline-block";
      } else {
        lightboxAward.style.display = "none";
      }
    }

    // Credits / Co-owners
    let hasMeta = false;
    if (lightboxCredits && boxCredits) {
      if (credits) {
        lightboxCredits.textContent = credits;
        boxCredits.style.display = "flex";
        hasMeta = true;
      } else {
        boxCredits.style.display = "none";
      }
    }

    // Tools
    if (lightboxTools && boxTools) {
      if (tools) {
        lightboxTools.textContent = tools;
        boxTools.style.display = "flex";
        hasMeta = true;
      } else {
        boxTools.style.display = "none";
      }
    }

    if (metaGrid) {
      metaGrid.style.display = hasMeta ? "flex" : "none";
    }

    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
    if (lightboxVideo) {
      lightboxVideo.pause();
    }
  }

  document.querySelectorAll("[data-lightbox]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      const video = el.querySelector("video");
      const img = el.querySelector("img");

      // Find title and description: check element attributes, or look up to parent project group
      let title = el.getAttribute("data-title");
      let desc = el.getAttribute("data-desc");

      if (!title || !desc) {
        const projectGroup = el.closest(".project-group");
        if (projectGroup) {
          const groupTitle = projectGroup.querySelector(".project-group-title strong")?.textContent;
          const groupSub = projectGroup.querySelector(".project-group-title")?.textContent;
          const groupDesc = projectGroup.querySelector(".project-group-desc")?.textContent;
          if (!title) title = groupTitle || img?.alt || "Project";
          if (!desc) desc = groupDesc || groupSub?.replace("+", "").trim() || "";
        }
      }

      if (!title) title = (img ? img.alt : "Artwork");
      if (!desc) desc = "";

      const credits = el.getAttribute("data-credits") || "";
      const tools = el.getAttribute("data-tools") || "";
      const award = el.getAttribute("data-award") || "";

      if (video) {
        const source = video.querySelector("source");
        const vSrc = (source && source.src) ? source.src : video.src;
        openLightbox(vSrc, true, title, desc, credits, tools, award);
      } else if (img) {
        openLightbox(img.currentSrc || img.src, false, title, desc, credits, tools, award);
      }
    });
  });

  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      // Close when clicking backdrop or close button, but not the image itself
      if (e.target === lightbox || e.target.closest("#lightbox-close") || e.target.closest(".lightbox-caption")) {
        closeLightbox();
      }
    });
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
  /* Reads the REAL column count and gap from the rendered grid, so the same
     code works at 4 columns on desktop and 2 columns on phone. */
  function readGridMetrics(grid) {
    const cs = getComputedStyle(grid);
    const tracks = (cs.gridTemplateColumns || "").trim().split(/\s+/).filter(Boolean);
    const cols = tracks.length || 1;
    const gap = parseFloat(cs.columnGap) || 0;
    const colWidth = (grid.clientWidth - gap * (cols - 1)) / cols;
    return { cols, gap, colWidth };
  }

  function resizeArtItems() {
    const grid = document.querySelector(".art-masonry");
    if (!grid) return;

    const { cols, gap, colWidth } = readGridMetrics(grid);
    if (!colWidth || colWidth <= 10) return;

    const rowHeight = 2;
    const items = grid.querySelectorAll(".art-item");

    items.forEach((item) => {
      let h = 0;
      if (item.classList.contains("art-item-span2")) {
        // spans 2 columns when the grid has them, otherwise a single column
        const spanCols = Math.min(2, cols);
        const span2Width = colWidth * spanCols + gap * (spanCols - 1);
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
