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

  // Build Sanity query endpoint URL
  function buildSanityQueryUrl(query) {
    const encoded = encodeURIComponent(query);
    return `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${encoded}`;
  }

  // Convert Sanity asset reference to live CDN URL
  function urlForSanityImage(assetRef) {
    if (!assetRef || !assetRef._ref) return null;
    const ref = assetRef._ref; // e.g. "image-50ddbba...-1200x800-webp"
    const parts = ref.split("-");
    if (parts.length < 4) return null;
    const id = parts[1];
    const dimensions = parts[2];
    const format = parts[3];
    return `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${id}-${dimensions}.${format}`;
  }

  function urlForSanityFile(assetRef) {
    if (!assetRef || !assetRef._ref) return null;
    const parts = assetRef._ref.split("-");
    if (parts.length < 3) return null;
    const id = parts[1];
    const format = parts[2];
    return `https://cdn.sanity.io/files/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${id}.${format}`;
  }

  /* Fetch live artworks from Sanity */
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
      if (!res.ok) return; // Keep existing static markup if offline or empty
      const data = await res.json();
      if (!data.result || !data.result.length) return;

      // Populate art grid dynamically from Sanity!
      artGrid.innerHTML = data.result.map((item) => {
        if (item.mediaType === "video" && item.videoFile?.asset?.url) {
          const spanClass = item.spanTwoColumns ? " art-item-span2" : "";
          return `
            <figure class="art-item${spanClass}">
              <video autoplay muted loop playsinline preload="auto">
                <source src="${item.videoFile.asset.url}" type="video/mp4" />
              </video>
            </figure>
          `;
        }

        const imgUrl = urlForSanityImage(item.image?.asset);
        if (!imgUrl) return "";

        return `
          <figure class="art-item" data-lightbox>
            <img src="${imgUrl}" alt="${item.title || "Artwork"}" loading="lazy" decoding="async" />
          </figure>
        `;
      }).join("");

      // Trigger masonry layout recalculation
      if (typeof window.dispatchEvent === "function") {
        window.dispatchEvent(new Event("resize"));
      }
    } catch (e) {
      // Graceful fallback to static files
    }
  }

  // Run on load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadSanityArtworks);
  } else {
    loadSanityArtworks();
  }
})();
