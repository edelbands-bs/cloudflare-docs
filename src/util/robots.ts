import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Parses the `Disallow` directives from `public/robots.txt` for the wildcard
 * user-agent (`*`) and returns them as an array of path prefixes.
 *
 * Only `User-agent: *` blocks are considered. Blank `Disallow` entries
 * (which re-allow everything) are ignored.
 */
export function parseDisallowedPaths(robotsTxt: string): string[] {
	const disallowed: string[] = [];
	let isWildcardGroup = false;
	let readingUserAgents = false;

	for (const rawLine of robotsTxt.split("\n")) {
		const line = rawLine.split("#", 1)[0].trim();

		if (line === "") continue;

		if (line.toLowerCase().startsWith("user-agent:")) {
			const agent = line.slice("user-agent:".length).trim();
			if (!readingUserAgents) isWildcardGroup = false;
			isWildcardGroup ||= agent === "*";
			readingUserAgents = true;
			continue;
		}

		readingUserAgents = false;

		if (!isWildcardGroup) continue;

		if (line.toLowerCase().startsWith("disallow:")) {
			const path = line.slice("disallow:".length).split("#")[0].trim();
			if (path) disallowed.push(path);
		}
	}

	return disallowed;
}

// Evaluated once at build time.
const DISALLOWED_PATHS = parseDisallowedPaths(
	readFileSync(join(process.cwd(), "public", "robots.txt"), "utf-8"),
);

/**
 * Returns `true` if the given URL path is disallowed by `robots.txt`.
 *
 * Matching follows the standard robots.txt prefix rule: a disallow entry
 * matches any path that starts with the entry's value.
 *
 * @param urlPath - An absolute URL path starting with `/`, e.g. `/plans/`.
 */
export function isDisallowedByRobots(urlPath: string): boolean {
	return DISALLOWED_PATHS.some((disallowed) => urlPath.startsWith(disallowed));
}
