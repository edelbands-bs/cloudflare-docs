import { describe, expect, test } from "vitest";
import { parseDisallowedPaths } from "./robots";

describe("parseDisallowedPaths", () => {
	test("collects directives for wildcard user-agent groups", () => {
		const paths = parseDisallowedPaths(`
User-agent: ExampleBot
User-agent: *
Disallow: /private/
Disallow: /preview/ # Do not include preview pages

User-agent: OtherBot
Disallow: /other-bot-only/
`);

		expect(paths).toEqual(["/private/", "/preview/"]);
	});

	test("does not carry wildcard matching into the next user-agent group", () => {
		const paths = parseDisallowedPaths(`
User-agent: *
Disallow: /private/

User-agent: OtherBot
Disallow: /other-bot-only/
`);

		expect(paths).toEqual(["/private/"]);
	});
});
