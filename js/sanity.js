/* =========================================================
   Zelrey — Portfolio · Sanity CMS Client & Live Sync
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

  async function loadSanityArtworks() {
    const artGrid = document.querySelector(".art-masonry");
    if (!artGrid) return;

    const query = `*[_type == "artwork"] | order(order asc) {
      _id,
      title,
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

      // Add each published Sanity artwork into the live gallery
      data.result.forEach((item) => {
        // Prevent duplicate injection
        if (document.getElementById(`sanity-${item._id}`)) return;

        const isVideo = item.mediaType === "video" && item.videoFile?.asset?.url;
        const imgUrl = urlForSanityImage(item.image?.asset);
        if (!isVideo && !imgUrl) return;

        const figure = document.createElement("figure");
        figure.id = `sanity-${item._id}`;
        figure.className = "art-item" + (item.spanTwoColumns ? " art-item-span2" : "");
        figure.setAttribute("data-lightbox", "");
        figure.setAttribute("data-title", item.title || "Artwork");
        figure.setAttribute("data-desc", "Published from Zelrey Art Studio.");

        if (isVideo) {
          figure.innerHTML = `
            <video autoplay muted loop playsinline preload="auto">
              <source src="${item.videoFile.asset.url}" type="video/mp4" />
            </video>
          `;
        } else {
          figure.innerHTML = `
            <img src="${imgUrl}" alt="${item.title || "Artwork"}" loading="lazy" decoding="async" />
          `;
        }

        // Attach click listener for lightbox
        figure.addEventListener("click", (e) => {
          e.stopPropagation();
          const video = figure.querySelector("video");
          const img = figure.querySelector("img");
          const title = figure.getAttribute("data-title") || "Artwork";
          const desc = figure.getAttribute("data-desc") || "";

          if (video) {
            const src = video.querySelector("source")?.src || video.src;
            if (typeof openLightbox === "function") openLightbox(src, true, title, desc);
          } else if (img) {
            if (typeof openLightbox === "function") openLightbox(img.src, false, title, desc);
          }
        });

        // Insert at beginning of artworks
        artGrid.appendChild(figure);
      });

      // Recalculate masonry layout
      window.dispatchEvent(new Event("resize"));
      setTimeout(() => window.dispatchEvent(new Event("resize")), 120);
    } catch (e) {
      // Offline fallback
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadSanityArtworks);
  } else {
    loadSanityArtworks();
  }
})();
