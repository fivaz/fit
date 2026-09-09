// Cloudflare Worker: transparently rewrites bare app-route requests (e.g. "/settings") to
// their matching pre-rendered static file ("settings.html") at the edge.
//
// Why this exists: apps/web builds as a Next.js static export (output: "export", no
// trailingSlash), which writes one flat "<route>.html" file per page. It's served from Azure
// Storage static website hosting, which resolves requests by *exact* blob name only — there's
// no extensionless-path resolution and no SPA fallback beyond a single global 404 document. So
// both a direct browser navigation to "/settings" AND Next's own client router (which fires a
// `fetch(path, { method: "HEAD" })` existence check before prefetching a <Link>) hit a real 404
// from Azure. This worker sits in front of the zone (Cloudflare-proxied) and rewrites the
// request before it reaches Azure, so the origin always sees the exact blob name and returns a
// real 200 — for both GET navigations and Next's HEAD prefetch probes, with no visible redirect.
export default {
	async fetch(request) {
		const url = new URL(request.url);
		const path = url.pathname;
		const lastSegment = path.slice(path.lastIndexOf("/") + 1);

		// Leave the root, anything already ending in "/", and anything that already looks like a
		// file (has a "." in its last segment — covers /_next/static/*.js, *.css, images,
		// manifest.json, favicon.ico, robots.txt, etc.) untouched.
		if (path === "/" || path.endsWith("/") || lastSegment.includes(".")) {
			return fetch(request);
		}

		const rewritten = new URL(url);
		rewritten.pathname = `${path}.html`;
		return fetch(new Request(rewritten, request));
	},
};
