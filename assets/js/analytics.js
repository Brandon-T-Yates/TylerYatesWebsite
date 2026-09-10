(() => {
  "use strict";

  const MEASUREMENT_ID = "G-E3XY6Z4DZ7";
  const CONSENT_KEY = "tyler_portfolio_analytics_consent";
  const CONSENT_EVENT = "tyler:analytics-consent-change";
  const SCRIPT_ID = "tyler-portfolio-ga4";
  const VALID_CONSENT = new Set(["granted", "denied"]);

  let sessionConsent = null;
  let analyticsLoadRequested = false;

  function getConsent() {
    try {
      const storedConsent = window.localStorage.getItem(CONSENT_KEY);
      if (VALID_CONSENT.has(storedConsent)) {
        sessionConsent = storedConsent;
      }
    } catch (_error) {
      // Storage may be unavailable in restrictive browsing modes.
    }

    return sessionConsent;
  }

  function persistConsent(value) {
    sessionConsent = value;

    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch (_error) {
      // Keep honoring the choice for this page when storage is unavailable.
    }
  }

  function initializeGtagQueue() {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() {
      window.dataLayer.push(arguments);
    };
  }

  function loadAnalytics() {
    if (getConsent() !== "granted") {
      return false;
    }

    if (analyticsLoadRequested || document.getElementById(SCRIPT_ID)) {
      analyticsLoadRequested = true;
      return true;
    }

    analyticsLoadRequested = true;
    window[`ga-disable-${MEASUREMENT_ID}`] = false;
    initializeGtagQueue();

    window.gtag("consent", "default", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
    window.gtag("js", new Date());
    window.gtag("config", MEASUREMENT_ID, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });

    const analyticsScript = document.createElement("script");
    analyticsScript.id = SCRIPT_ID;
    analyticsScript.async = true;
    analyticsScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
    document.head.append(analyticsScript);
    return true;
  }

  function clearAnalyticsCookies() {
    const cookieNames = document.cookie
      .split(";")
      .map((cookie) => cookie.split("=")[0].trim())
      .filter((name) => name === "_ga" || name.startsWith("_ga_"));

    const hostname = window.location.hostname;
    const hostnameParts = hostname.split(".");
    const registrableDomain = hostnameParts.length > 2
      ? hostnameParts.slice(-2).join(".")
      : hostname;

    cookieNames.forEach((name) => {
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
      if (hostname) {
        document.cookie = `${name}=; Max-Age=0; path=/; domain=${hostname}; SameSite=Lax`;
      }
      if (registrableDomain && registrableDomain !== hostname) {
        document.cookie = `${name}=; Max-Age=0; path=/; domain=.${registrableDomain}; SameSite=Lax`;
      }
    });
  }

  function setConsent(value) {
    if (!VALID_CONSENT.has(value)) {
      return false;
    }

    persistConsent(value);

    if (value === "granted") {
      window[`ga-disable-${MEASUREMENT_ID}`] = false;

      if (analyticsLoadRequested && typeof window.gtag === "function") {
        window.gtag("consent", "update", {
          analytics_storage: "granted",
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied"
        });
      } else {
        loadAnalytics();
      }
    } else {
      window[`ga-disable-${MEASUREMENT_ID}`] = true;
      clearAnalyticsCookies();
    }

    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, {
      detail: { consent: value }
    }));
    return true;
  }

  function trackAnalyticsEvent(eventName, parameters = {}) {
    if (getConsent() !== "granted" || typeof eventName !== "string" || !eventName) {
      return false;
    }

    if (!loadAnalytics() || typeof window.gtag !== "function") {
      return false;
    }

    try {
      window.gtag("event", eventName, parameters);
      return true;
    } catch (_error) {
      return false;
    }
  }

  window.trackAnalyticsEvent = trackAnalyticsEvent;
  window.tylerAnalytics = Object.freeze({
    consentKey: CONSENT_KEY,
    consentEvent: CONSENT_EVENT,
    getConsent,
    setConsent,
    loadAnalytics,
    trackEvent: trackAnalyticsEvent
  });

  document.addEventListener("click", (event) => {
    const trackedElement = event.target.closest?.("[data-ga-event]");
    if (!trackedElement) {
      return;
    }

    const parameters = {
      link_text: trackedElement.textContent.trim().replace(/\s+/g, " "),
      link_location: trackedElement.dataset.gaLocation || "content"
    };

    if (trackedElement.href) {
      parameters.link_url = trackedElement.href;
    }

    trackAnalyticsEvent(trackedElement.dataset.gaEvent, parameters);
  });

  if (getConsent() === "granted") {
    loadAnalytics();
  } else {
    window[`ga-disable-${MEASUREMENT_ID}`] = true;
  }
})();
