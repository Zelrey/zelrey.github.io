/* =========================================================
   Zelrey — Portfolio · Contact modal + form (FormSubmit AJAX)
   ========================================================= */

(function () {
  "use strict";

  const modalBackdrop = document.getElementById("contact-modal");
  const modalClose = document.querySelectorAll("[data-close-modal]");
  const contactTriggers = document.querySelectorAll("[data-contact]");
  const contactForm = document.getElementById("contact-form");

  function openModal() {
    if (!modalBackdrop) return;
    modalBackdrop.classList.add("open");
    modalBackdrop.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    const first = modalBackdrop.querySelector("input, textarea, button");
    if (first) setTimeout(() => first.focus(), 80);
  }

  function closeModal() {
    if (!modalBackdrop) return;
    modalBackdrop.classList.remove("open");
    modalBackdrop.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  contactTriggers.forEach((el) =>
    el.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    })
  );

  modalClose.forEach((el) => el.addEventListener("click", closeModal));

  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  if (!contactForm) return;

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const status = document.getElementById("form-status");
    const original = btn ? btn.textContent : "Send message";

    // Honeypot — bots only
    const honey = contactForm.querySelector('[name="_honey"]');
    if (honey && honey.value) return;

    if (btn) {
      btn.textContent = "Sending…";
      btn.disabled = true;
    }
    const sendFrame = document.getElementById("frame-send-message");
    if (sendFrame && sendFrame.contentWindow) {
      sendFrame.contentWindow.postMessage({ formState: "Sending…" }, "*");
    }
    if (status) {
      status.textContent = "";
      status.classList.remove("is-ok", "is-err");
    }

    const data = new FormData(contactForm);

    try {
      const res = await fetch("https://formsubmit.co/ajax/mcclasen199@gmail.com", {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      if (!res.ok) throw new Error("send failed");

      if (status) {
        status.textContent = "Sent — I’ll get back to you soon.";
        status.classList.add("is-ok");
      }
      if (btn) btn.textContent = "Sent";
      if (sendFrame && sendFrame.contentWindow) {
        sendFrame.contentWindow.postMessage({ formState: "Sent" }, "*");
      }
      contactForm.reset();
      setTimeout(() => {
        closeModal();
        if (btn) {
          btn.textContent = original;
          btn.disabled = false;
        }
        if (sendFrame && sendFrame.contentWindow) {
          sendFrame.contentWindow.postMessage({ formState: "Send message" }, "*");
        }
        if (status) {
          status.textContent = "";
          status.classList.remove("is-ok", "is-err");
        }
      }, 1600);
    } catch (err) {
      if (status) {
        status.textContent = "Couldn’t send. Email me at mcclasen199@gmail.com";
        status.classList.add("is-err");
      }
      if (btn) {
        btn.textContent = original;
        btn.disabled = false;
      }
    }
  });

  
  // Listen for Liquid Metal Button activate message ("Hire me", "Start a project")
  window.addEventListener("message", (e) => {
    if (e.data && e.data.liquidMetalButton && e.data.liquidMetalButton.type === "activate") {
      openModal();
    }
  });

  // Listen for Liquid Metal "Send message" button click inside modal iframe
  window.addEventListener("message", (e) => {
    if (e.data && e.data.liquidMetalButton && e.data.liquidMetalButton.type === "submitContact") {
      if (contactForm) {
        // Trigger HTML5 validation check
        if (contactForm.reportValidity()) {
          contactForm.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
        }
      }
    }
  });

})();
