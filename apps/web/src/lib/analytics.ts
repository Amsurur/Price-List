// Fire-and-forget storefront page-view beacon. Deliberately separate from
// api.ts's request() helper, which sends credentials and redirects to
// /admin/login on a 401 — both wrong for an anonymous, unauthenticated ping.

const VISITOR_ID_KEY = "sc_visitor_id";

function getVisitorId(): string | undefined {
  try {
    let id = window.localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch {
    // Private mode / storage disabled — track the view without a visitor id.
    return undefined;
  }
}

export function trackPageView(path: string): void {
  if (path.startsWith("/admin")) return;

  const payload = JSON.stringify({
    path,
    visitorId: getVisitorId(),
    referrer: document.referrer || undefined,
  });
  const url = "/api/analytics/page-views";

  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }));
  } else {
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }
}
