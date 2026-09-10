(() => {
  "use strict";

  const analytics = window.tylerAnalytics;
  if (!analytics) {
    return;
  }

  const STATUS_COPY = {
    granted: "Analytics preference: allowed",
    denied: "Analytics preference: disabled",
    undecided: "Analytics preference: not selected"
  };
  const privacyDetailsHref = /\/privacy\.html$/i.test(window.location.pathname)
    ? "#privacy-choices"
    : "privacy.html";

  const banner = document.createElement("aside");
  banner.className = "privacy-banner";
  banner.hidden = true;
  banner.setAttribute("aria-labelledby", "privacy-banner-title");
  banner.innerHTML = `
    <div class="privacy-banner-inner">
      <div>
        <h2 class="privacy-banner-title" id="privacy-banner-title">Optional analytics</h2>
        <p class="privacy-banner-copy">Choose whether this portfolio may use Google Analytics to measure aggregate visits and interactions.</p>
      </div>
      <div class="privacy-banner-actions">
        <button class="privacy-consent-button" type="button" data-analytics-consent="granted">Allow Analytics</button>
        <button class="privacy-consent-button" type="button" data-analytics-consent="denied">No Thanks</button>
        <a class="privacy-learn-more" href="${privacyDetailsHref}">Learn More</a>
      </div>
    </div>`;
  document.body.append(banner);

  function updateConsentUi(consent = analytics.getConsent()) {
    const normalizedConsent = consent === "granted" || consent === "denied"
      ? consent
      : "undecided";

    document.querySelectorAll("[data-analytics-consent-status]").forEach((status) => {
      status.textContent = STATUS_COPY[normalizedConsent];
    });

    document.querySelectorAll("[data-analytics-consent]").forEach((button) => {
      const isSelected = button.dataset.analyticsConsent === normalizedConsent;
      button.classList.toggle("is-selected", isSelected);
      button.setAttribute("aria-pressed", String(isSelected));
    });

    banner.hidden = normalizedConsent !== "undecided";
  }

  window.tylerPrivacyConsent = Object.freeze({
    refresh: updateConsentUi
  });

  document.addEventListener("click", (event) => {
    const consentControl = event.target.closest?.("[data-analytics-consent]");
    if (!consentControl) {
      return;
    }

    const consent = consentControl.dataset.analyticsConsent;
    analytics.setConsent(consent);
  });

  window.addEventListener(analytics.consentEvent, (event) => {
    updateConsentUi(event.detail?.consent);
  });

  updateConsentUi();
})();
