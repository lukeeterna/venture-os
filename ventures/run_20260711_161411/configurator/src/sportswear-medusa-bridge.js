if (!window.__sportswearMedusaFetchInstalled) {
  const nativeFetch = window.fetch.bind(window);
  window.fetch = (input, init = {}) => {
    const url = typeof input === "string" ? input : input?.url || "";
    if (!url.includes("/store/sportswear/")) return nativeFetch(input, init);

    const headers = new Headers(input instanceof Request ? input.headers : undefined);
    new Headers(init.headers || {}).forEach((value, key) => headers.set(key, value));
    const publishableKey = String(window.__SPORTSWEAR_PUBLISHABLE_KEY || "").trim();
    if (publishableKey) headers.set("x-publishable-api-key", publishableKey);

    if (input instanceof Request) {
      return nativeFetch(new Request(input, { ...init, headers }));
    }
    return nativeFetch(input, { ...init, headers });
  };
  window.__sportswearMedusaFetchInstalled = true;
}
