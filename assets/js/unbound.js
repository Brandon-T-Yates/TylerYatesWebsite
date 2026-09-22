(() => {
  "use strict";

  const BACK_TO_TOP_SHOW_SCROLL_PX = 600;
  const legacyLayer = document.getElementById("legacy-layer");
  const scrollLine = document.getElementById("scroll-line");
  const backToTopShell = document.getElementById("back-to-top-shell");
  const backToTopButton = document.getElementById("back-to-top");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initializeScreenshots() {
  document.querySelectorAll("[data-unbound-screenshot]").forEach((figure) => {
    const image = figure.querySelector("img");
    if (!image) {
      return;
    }

    const markLoaded = () => {
      figure.dataset.imageState = "loaded";
    };
    const markMissing = () => {
      figure.dataset.imageState = "missing";
    };

    image.addEventListener("load", markLoaded, { once: true });
    image.addEventListener("error", markMissing, { once: true });

    if (image.complete) {
      if (image.naturalWidth > 0) {
        markLoaded();
      } else {
        markMissing();
      }
    }
  });
  }

  function syncLegacyHeight() {
    if (legacyLayer) {
      legacyLayer.style.height = `${document.documentElement.scrollHeight}px`;
    }
  }

  function updateScrollUi() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    if (scrollLine) {
      const percentage = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
      scrollLine.style.height = `${Math.max(0, Math.min(100, percentage))}%`;
    }

    if (backToTopShell) {
      const shouldShow = scrollTop > BACK_TO_TOP_SHOW_SCROLL_PX;
      backToTopShell.classList.toggle("opacity-0", !shouldShow);
      backToTopShell.classList.toggle("translate-y-20", !shouldShow);
      backToTopShell.classList.toggle("pointer-events-none", !shouldShow);
      backToTopShell.classList.toggle("opacity-100", shouldShow);
      backToTopShell.classList.toggle("translate-y-0", shouldShow);
    }
  }

  function initializeBackToTop() {
    backToTopButton?.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  function initializeRevealSystem() {
    const items = Array.from(document.querySelectorAll(".level-up"));
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      items.forEach((item) => {
        item.classList.add("opacity-100", "translate-y-0");
      });
      return;
    }

    items.forEach((item) => {
      item.classList.add(
        "opacity-0",
        "translate-y-5",
        "transition-all",
        "duration-700",
        "ease-out",
        "will-change-transform"
      );
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          entry.target.classList.add("opacity-100", "translate-y-0");
          entry.target.classList.remove("opacity-0", "translate-y-5");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );
    items.forEach((item) => observer.observe(item));
  }

  function initializePage() {
    initializeScreenshots();
    initializeBackToTop();
    initializeRevealSystem();
    syncLegacyHeight();
    updateScrollUi();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializePage, { once: true });
  } else {
    initializePage();
  }

  window.addEventListener("load", () => {
    syncLegacyHeight();
    updateScrollUi();
  });
  window.addEventListener("resize", () => {
    syncLegacyHeight();
    updateScrollUi();
  });
  window.addEventListener("scroll", updateScrollUi, { passive: true });
})();
