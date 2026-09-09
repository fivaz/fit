import Link from "next/link";

import { Button } from "@/components/ui/button";
import { APP_NAME, ROUTES } from "@/lib/consts";

/**
 * Azure Storage static website hosting resolves requests by exact blob name and has no
 * SPA/directory fallback, while `next export` (trailingSlash: false) writes every route as a
 * flat "<route>.html" file. So a direct load, refresh, or deep link to e.g. "/programs" 404s
 * even though "/programs.html" exists — Azure serves this page (its configured 404-document)
 * for that request. Redirect to the matching flat file before anything else renders. A path
 * that already ends in ".html" means the file genuinely doesn't exist, so fall through to the
 * message below instead of looping.
 */
const REDIRECT_SCRIPT = `(function(){var p=window.location.pathname;if(p==="/"||p.endsWith("/")||p.endsWith(".html"))return;window.location.replace(p+".html"+window.location.search+window.location.hash);})();`;

export default function NotFound() {
	return (
		<>
			<script dangerouslySetInnerHTML={{ __html: REDIRECT_SCRIPT }} />
			<div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-5 py-12 text-center">
				<h1 className="text-foreground text-lg font-semibold">Page not found</h1>
				<p className="text-muted-foreground text-sm">
					{APP_NAME} couldn&apos;t find what you&apos;re looking for.
				</p>
				<Button variant="outline" asChild>
					<Link href={ROUTES.HOME}>Go home</Link>
				</Button>
			</div>
		</>
	);
}
