(() => {
  "use strict";

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
})();
