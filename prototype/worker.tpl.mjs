const FILES = __FILES__;
const SEC = {
  "Content-Security-Policy": __CSP__,
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Strict-Transport-Security": "max-age=31536000",
  "Cache-Control": "no-cache"
};
const BIN = {};
const IMG_RE = /^\/images\/recipes\/[a-z][a-z0-9_]{1,39}(-thumb)?\.webp$/;
function body(path, f) {
  if (!f.b64) return f.b;
  if (!BIN[path]) { const s = atob(f.b64); const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); BIN[path] = u; }
  return BIN[path];
}
export default {
  async fetch(request, env) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", { status: 405, headers: { ...SEC, Allow: "GET, HEAD" } });
    }
    let path = new URL(request.url).pathname;
    if (path === "/") path = "/index.html";
    const f = Object.prototype.hasOwnProperty.call(FILES, path) ? FILES[path] : null;
    if (!f && env && env.IMG && IMG_RE.test(path)) {
      // Rezeptbilder ab v5.11 aus Workers KV (nur feste Namensform, nur Lesen)
      let img = null;
      try { img = await env.IMG.get(path.slice(1), "arrayBuffer"); } catch (e) { img = null; } // KV-Fehler/Kontingent: wie fehlende Datei
      if (img) return new Response(request.method === "HEAD" ? null : img, { status: 200, headers: { ...SEC, "Cache-Control": "public, max-age=86400", "Content-Type": "image/webp" } });
    }
    if (!f) return new Response("Nicht gefunden", { status: 404, headers: { ...SEC, "Content-Type": "text/plain; charset=utf-8" } });
    const extra = f.b64 ? { "Cache-Control": "public, max-age=86400" } : {};
    return new Response(request.method === "HEAD" ? null : body(path, f), { status: 200, headers: { ...SEC, ...extra, "Content-Type": f.t } });
  }
};
