/* =========================================================
   Zelrey — Portfolio · Projects view switcher (2 / 3 / 4 columns)
   ========================================================= */

(function () {
  "use strict";

  // Select all individual project groups
  const groups = document.querySelectorAll(".project-group");
  if (!groups.length) return;

  groups.forEach((group) => {
    const buttons = group.querySelectorAll(".view-btn[data-view]");
    if (!buttons.length) return;

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const cols = btn.getAttribute("data-view");

        // Update active state only within this specific project's buttons
        buttons.forEach((b) => {
          b.classList.toggle("active", b === btn);
        });

        // Update column class only for this specific project group
        group.classList.remove("view-cols-2", "view-cols-3", "view-cols-4");
        group.classList.add(`view-cols-${cols}`);
      });
    });
  });
})();
