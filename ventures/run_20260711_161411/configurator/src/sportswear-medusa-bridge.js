if (!window.__sportswearMedusaFetchInstalled) {
  const nativeFetch = window.fetch.bind(window);
  window.fetch = (input, init = {}) => {
    const url = typeof input === "string" ? input : input?.url || "";
    if (!url.includes("/store/sportswear/")) return nativeFetch(input, init);

    const headers = new Headers(input instanceof Request ? input.headers : undefined);
    new Headers(init.headers || {}).forEach((value, key) => headers.set(key, value));
    const publishableKey = String(window.__SPORTSWEAR_PUBLISHABLE_KEY || "").trim();
    const backofficeUrl = String(window.__SPORTSWEAR_BACKOFFICE_URL || "").trim();

    // The Medusa store routes require an explicit publishable key. When neither
    // the backend URL nor the key is configured (for example, the standalone
    // visual configurator), fail closed locally instead of issuing a bogus
    // same-origin request to the static server and producing a 404.
    if (!publishableKey && !backofficeUrl) {
      window.__sportswearMedusaOffline = true;
      return Promise.resolve(new Response(JSON.stringify({
        error: "sportswear_backoffice_not_configured",
      }), {
        status: 503,
        headers: { "content-type": "application/json" },
      }));
    }

    if (publishableKey) headers.set("x-publishable-api-key", publishableKey);

    if (input instanceof Request) {
      return nativeFetch(new Request(input, { ...init, headers }));
    }
    return nativeFetch(input, { ...init, headers });
  };
  window.__sportswearMedusaFetchInstalled = true;
}
