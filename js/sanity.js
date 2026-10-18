/* =========================================================
   Zelrey — Portfolio · Sanity CMS Live Connector
   Project: Portfolio (nczz4q4p)
   Dataset: production
   ========================================================= */

(function () {
  "use strict";

  const SANITY_PROJECT_ID = "nczz4q4p";
  const SANITY_DATASET = "production";
  const SANITY_API_VERSION = "2024-01-01";

  function buildSanityQueryUrl(query) {
    const encoded = encodeURIComponent(query);
    return `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${encoded}`;
  }

  function urlForSanityImage(assetRef) {
    if (!assetRef || !assetRef._ref) return null;
    const parts = assetRef._ref.split("-");
    if (parts.length < 4) return null;
    const id = parts[1];
    const dimensions = parts[2];
    const format = parts[3];
    return `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${id}-${dimensions}.${format}`;
  }

  /* 1. Live Artworks Loader */
  async function loadSanityArtworks() {
    const artGrid = document.querySelector(".art-masonry");
    if (!artGrid) return;

    const query = `*[_type == "artwork"] | order(order asc) {
      _id,
      title,
      description,
      order,
      mediaType,
      spanTwoColumns,
      image,
      videoFile { asset-> }
    }`;

    try {
      const res = await fetch(buildSanityQueryUrl(query));
      if (!res.ok) return;
      const data = await res.json();
      if (!data.result || !data.result.length) return;

      artGrid.innerHTML = data.result.map((item) => {
        const isVideo = item.mediaType === "video" && item.videoFile?.asset?.url;
        const imgUrl = urlForSanityImage(item.image?.asset);
        if (!isVideo && !imgUrl) return "";

        const spanClass = item.spanTwoColumns ? " art-item-span2" : "";
        const title = item.title || "Artwork";
        const desc = item.description || "";

        if (isVideo) {
          return `
            <figure class="art-item${spanClass}" data-lightbox data-title="${title}" data-desc="${desc}">
              <video autoplay muted loop playsinline preload="auto">
                <source src="${item.videoFile.asset.url}" type="video/mp4" />
              </video>
            </figure>
          `;
        }

        return `
          <figure class="art-item${spanClass}" data-lightbox data-title="${title}" data-desc="${desc}">
            <img src="${imgUrl}" alt="${title}" loading="lazy" decoding="async" />
          </figure>
        `;
      }).join("");

      // Bind lightbox click listeners to newly loaded items
      bindLightboxEvents(artGrid);

      // Trigger masonry layout calculation
      window.dispatchEvent(new Event("resize"));
      setTimeout(() => window.dispatchEvent(new Event("resize")), 120);
    } catch (e) {
      console.warn("Live artworks fetch:", e);
    }
  }

  /* 2. Live Projects Loader */
  async function loadSanityProjects() {
    const projectsContainer = document.querySelector("#page-projects .section");
    if (!projectsContainer) return;

    const query = `*[_type == "project"] | order(order asc) {
      _id,
      title,
      discipline,
      year,
      description,
      order,
      images[] {
        _type,
        mediaType,
        asset->,
        alt
      }
    }`;

    try {
      const res = await fetch(buildSanityQueryUrl(query));
      if (!res.ok) return;
      const data = await res.json();
      if (!data.result || !data.result.length) return;

      // Remove any existing dynamic project groups
      document.querySelectorAll(".sanity-dynamic-project").forEach((el) => el.remove());

      data.result.forEach((proj) => {
        const section = document.createElement("section");
        section.id = `sanity-proj-${proj._id}`;
        section.className = "project-group view-cols-2 sanity-dynamic-project";

        const imageCards = (proj.images || []).map((mediaObj, idx) => {
          const isVideo = mediaObj.mediaType === "video" || mediaObj._type === "file" || (mediaObj.asset?.url && mediaObj.asset.url.endsWith(".mp4"));
          const mediaUrl = mediaObj.asset?.url;
          if (!mediaUrl) return "";

          if (isVideo) {
            return `
              <div class="project-item">
                <div class="project-thumb project-thumb--video" data-lightbox data-title="${proj.title}" data-desc="${proj.description || proj.discipline}">
                  <video autoplay muted loop playsinline preload="auto">
                    <source src="${mediaUrl}" type="video/mp4" />
                  </video>
                </div>
              </div>
            `;
          }

          return `
            <div class="project-item">
              <div class="project-thumb" data-lightbox data-title="${proj.title}" data-desc="${proj.description || proj.discipline}">
                <img src="${mediaUrl}" alt="${mediaObj.alt || proj.title}" loading="lazy" decoding="async" />
              </div>
            </div>
          `;
        }).join("");

                section.innerHTML = `
          <header class="project-group-head">
            <div>
              <h2 class="project-group-title">
                <strong>${proj.title}</strong>, ${proj.discipline || ""}, ${proj.year || "2026"} <span class="plus-icon">+</span>
              </h2>
              </div>
            <div class="view-options" role="group" aria-label="Grid view options">
              <button type="button" class="view-btn active" data-view="2" aria-label="2 Columns View" title="2 Columns">
                <svg viewBox="0 0 18 18" width="18" height="18" fill="currentColor"><rect x="1.5" y="5.5" width="6.5" height="6.5" rx="1.2"/><rect x="10" y="5.5" width="6.5" height="6.5" rx="1.2"/></svg>
              </button>
              <button type="button" class="view-btn" data-view="3" aria-label="3 Columns View" title="3 Columns">
                <svg viewBox="0 0 18 18" width="18" height="18" fill="currentColor"><rect x="5.75" y="1.5" width="6.5" height="6.5" rx="1.2"/><rect x="1.5" y="10" width="6.5" height="6.5" rx="1.2"/><rect x="10" y="10" width="6.5" height="6.5" rx="1.2"/></svg>
              </button>
              <button type="button" class="view-btn" data-view="4" aria-label="4 Columns View" title="4 Columns">
                <svg viewBox="0 0 18 18" width="18" height="18" fill="currentColor"><rect x="1.5" y="1.5" width="6.5" height="6.5" rx="1.2"/><rect x="10" y="1.5" width="6.5" height="6.5" rx="1.2"/><rect x="1.5" y="10" width="6.5" height="6.5" rx="1.2"/><rect x="10" y="10" width="6.5" height="6.5" rx="1.2"/></svg>
              </button>
            </div>
          </header>
          <div class="project-group-grid">
            ${imageCards}
          </div>
        `;

        // Bind view switcher buttons for this project
        const buttons = section.querySelectorAll(".view-btn[data-view]");
        buttons.forEach((btn) => {
          btn.addEventListener("click", () => {
            const cols = btn.getAttribute("data-view");
            buttons.forEach((b) => b.classList.toggle("active", b === btn));
            section.classList.remove("view-cols-2", "view-cols-3", "view-cols-4");
            section.classList.add(`view-cols-${cols}`);
          });
        });

        // Insert before footer
        const footer = projectsContainer.querySelector(".site-footer");
        if (footer) {
          projectsContainer.insertBefore(section, footer);
        } else {
          projectsContainer.appendChild(section);
        }

        bindLightboxEvents(section);
      });
    } catch (e) {
      console.warn("Live projects fetch:", e);
    }
  }

  function bindLightboxEvents(container) {
    if (!container) return;
    container.querySelectorAll("[data-lightbox]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        const video = el.querySelector("video");
        const img = el.querySelector("img");
        const title = el.getAttribute("data-title") || (img ? img.alt : "Artwork");
        const desc = el.getAttribute("data-desc") || "";

        if (video) {
          const source = video.querySelector("source");
          const vSrc = (source && source.src) ? source.src : video.src;
          if (typeof openLightbox === "function") openLightbox(vSrc, true, title, desc);
        } else if (img) {
          if (typeof openLightbox === "function") openLightbox(img.currentSrc || img.src, false, title, desc);
        }
      });
    });
  }

  // Initialize
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      loadSanityArtworks();
      loadSanityProjects();
    });
  } else {
    loadSanityArtworks();
    loadSanityProjects();
  }
})();
