(() => {
  "use strict";

  const triggers = Array.from(
    document.querySelectorAll("[data-site-info-trigger]")
  );

  if (!triggers.length) {
    return;
  }

  const modal = document.createElement("div");
  modal.id = "site-info-dialog";
  modal.className = "site-info-modal";
  modal.hidden = true;

  modal.innerHTML = `
    <section
      class="site-info-panel-ring"
      role="dialog"
      aria-modal="true"
      aria-labelledby="site-info-heading"
      aria-describedby="site-info-description"
    >
      <div class="site-info-panel">

        <div class="site-info-close-ring">
          <button
            class="site-info-close"
            type="button"
            aria-label="Close Site Info & Privacy dialog"
            data-site-info-close
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.25"
              ></path>
            </svg>
          </button>
        </div>

        <h2 class="site-info-heading" id="site-info-heading">
          Site Info &amp; Privacy
        </h2>

        <div class="site-info-copy" id="site-info-description">
          <p>
            This is my personal portfolio. The views and opinions shared here
            are my own and do not represent my current or former employers.
            Company names, product names, logos, and trademarks referenced on
            this site belong to their respective owners.
          </p>

          <p>
            Projects and case studies shown here are based on my own work,
            learning, or publicly shareable information. No confidential or
            proprietary employer information is intentionally published.
          </p>

          <p>
            This site uses Google Analytics to help me understand aggregate
            site traffic and how visitors interact with the portfolio.
            Google Analytics may use cookies or similar technologies to
            measure site usage and interactions. External links may take you
            to websites with their own privacy policies and terms.
          </p>

          <p class="site-info-contact">
            Questions? Contact me at
            <a href="mailto:tyler@tyleryates.me">
              tyler@tyleryates.me
            </a>
          </p>
        </div>

      </div>
    </section>
  `;

  document.body.append(modal);

  const closeButton = modal.querySelector("[data-site-info-close]");

  const focusableSelector = `
    a[href],
    button:not([disabled]),
    input:not([disabled]),
    select:not([disabled]),
    textarea:not([disabled]),
    [tabindex]:not([tabindex="-1"])
  `;

  let activeTrigger = null;

  function openModal(trigger) {
    activeTrigger = trigger;

    modal.hidden = false;

    document.documentElement.classList.add("site-info-modal-open");
    document.body.classList.add("site-info-modal-open");

    window.requestAnimationFrame(() => {
      closeButton?.focus();
    });
  }

  function closeModal() {
    if (modal.hidden) {
      return;
    }

    modal.hidden = true;

    document.documentElement.classList.remove("site-info-modal-open");
    document.body.classList.remove("site-info-modal-open");

    activeTrigger?.focus();
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      openModal(trigger);
    });
  });

  closeButton?.addEventListener("click", closeModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (modal.hidden) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeModal();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = Array.from(
      modal.querySelectorAll(focusableSelector)
    );

    if (!focusableElements.length) {
      return;
    }

    const firstFocusable = focusableElements[0];
    const lastFocusable =
      focusableElements[focusableElements.length - 1];

    if (
      event.shiftKey &&
      document.activeElement === firstFocusable
    ) {
      event.preventDefault();
      lastFocusable.focus();
    } else if (
      !event.shiftKey &&
      document.activeElement === lastFocusable
    ) {
      event.preventDefault();
      firstFocusable.focus();
    }
  });
})();
