/**
 * Tab logic and form handlers for the Auth Demos frontend.
 * This script expects the following elements to be present in index.html:
 *
 * Tabs:
 * - #basic-tab, #opaque-tab, #jwt-tab (buttons)
 * - #basic-panel, #opaque-panel, #jwt-panel (sections)
 *
 * Basic form:
 * - #basic-form (form)
 * - #basic-username (input)
 * - #basic-password (input)
 * - #basic-reset (button)
 * - #basic-result (pre)
 *
 * Opaque form:
 * - #opaque-form (form)
 * - #opaque-email (input)
 * - #opaque-password (input)
 * - #opaque-reset (button)
 * - #opaque-result (pre)
 *
 * JWT form:
 * - #jwt-form (form)
 * - #jwt-email (input)
 * - #jwt-password (input)
 * - #jwt-reset (button)
 * - #jwt-result (pre)
 */

type Tab = {
	btn: HTMLElement;
	panel: HTMLElement;
};

function nonNull<T>(value: T | null, id: string): T {
	if (value == null) {
		throw new Error(`Expected element #${id} to exist in the DOM`);
	}
	return value;
}

function setupTabs() {
	const tabs: Tab[] = [
		{
			btn: nonNull(document.getElementById("basic-tab"), "basic-tab"),
			panel: nonNull(document.getElementById("basic-panel"), "basic-panel"),
		},
		{
			btn: nonNull(document.getElementById("opaque-tab"), "opaque-tab"),
			panel: nonNull(document.getElementById("opaque-panel"), "opaque-panel"),
		},
		{
			btn: nonNull(document.getElementById("jwt-tab"), "jwt-tab"),
			panel: nonNull(document.getElementById("jwt-panel"), "jwt-panel"),
		},
	];

	function selectTab(index: number) {
		tabs.forEach((t, i) => {
			const selected = i === index;
			t.btn.setAttribute("aria-selected", String(selected));
			t.panel.classList.toggle("hidden", !selected);
		});
	}

	tabs.forEach((t, i) => {
		t.btn.addEventListener("click", () => selectTab(i));
		t.btn.addEventListener("keydown", (ev: KeyboardEvent) => {
			if (ev.key === "ArrowRight") selectTab((i + 1) % tabs.length);
			if (ev.key === "ArrowLeft")
				selectTab((i - 1 + tabs.length) % tabs.length);
		});
	});

	// Ensure initial state shows the first tab
	selectTab(0);
}

function base64(str: string) {
	// btoa expects binary string; ensure UTF-8 handling for non-ASCII input
	return btoa(unescape(encodeURIComponent(str)));
}

function setupBasicForm() {
	const form = nonNull(
		document.getElementById("basic-form"),
		"basic-form",
	) as HTMLFormElement;
	const result = nonNull(
		document.getElementById("basic-result"),
		"basic-result",
	) as HTMLPreElement;
	const resetBtn = nonNull(
		document.getElementById("basic-reset"),
		"basic-reset",
	);

	resetBtn.addEventListener("click", () => {
		form.reset();
		result.textContent = "No request yet.";
	});

	form.addEventListener("submit", (ev) => {
		ev.preventDefault();
		const username =
			(
				nonNull(
					document.getElementById("basic-username"),
					"basic-username",
				) as HTMLInputElement
			).value || "";
		const password =
			(
				nonNull(
					document.getElementById("basic-password"),
					"basic-password",
				) as HTMLInputElement
			).value || "";
		const auth = `Basic ${base64(`${username}:${password}`)}`;

		(async () => {
			result.textContent = "Requesting...";
			try {
				const res = await fetch(
					"http://localhost:3000/basic/protected-resource",
					{
						method: "GET",
						headers: {
							Authorization: auth,
						},
					},
				);
				const body = await res.json().catch(() => ({}));
				result.textContent = [
					`GET http://localhost:3000/basic/protected-resource`,
					`Status: ${res.status} ${res.statusText}`,
					`Authorization: ${auth}`,

					`Response: ${JSON.stringify(body, null, 2)}`,
				].join("\n");
			} catch (err) {
				result.textContent = `Error: ${(err as Error).message}`;
			}
		})();
	});
}

function setupOpaqueForm() {
	const form = nonNull(
		document.getElementById("opaque-form"),
		"opaque-form",
	) as HTMLFormElement;
	const result = nonNull(
		document.getElementById("opaque-result"),
		"opaque-result",
	) as HTMLPreElement;
	const resetBtn = nonNull(
		document.getElementById("opaque-reset"),
		"opaque-reset",
	);

	resetBtn.addEventListener("click", () => {
		form.reset();
		result.textContent = "No request yet.";
	});

	form.addEventListener("submit", (ev) => {
		ev.preventDefault();
		const username =
			(
				nonNull(
					document.getElementById("opaque-username"),

					"opaque-username",
				) as HTMLInputElement
			).value || "";

		const password =
			(
				nonNull(
					document.getElementById("opaque-password"),

					"opaque-password",
				) as HTMLInputElement
			).value || "";

		(async () => {
			result.textContent = "Requesting...";

			try {
				const loginRes = await fetch(
					"http://localhost:3000/bearer/opaque/login",

					{
						method: "POST",

						headers: { "Content-Type": "application/json" },

						body: JSON.stringify({ username, password }),
					},
				);

				const loginBody = await loginRes.json().catch(() => ({}));

				if (!loginRes.ok) {
					result.textContent = [
						`POST http://localhost:3000/bearer/opaque/login`,

						`Status: ${loginRes.status} ${loginRes.statusText}`,

						`Body: ${JSON.stringify(loginBody, null, 2)}`,
					].join("\n");

					return;
				}

				const token = (loginBody as { access_token?: string }).access_token;

				if (!token) {
					result.textContent = [
						`POST http://localhost:3000/bearer/opaque/login`,

						`Status: ${loginRes.status} ${loginRes.statusText}`,

						`Body: ${JSON.stringify(loginBody, null, 2)}`,

						`Error: access_token missing from response`,
					].join("\n");

					return;
				}

				const meRes = await fetch(
					"http://localhost:3000/bearer/opaque/protected-resource",

					{
						method: "GET",

						headers: { Authorization: `Bearer ${token}` },
					},
				);

				const meBody = await meRes.json().catch(() => ({}));

				result.textContent = [
					`POST http://localhost:3000/bearer/opaque/login`,

					`Status: ${loginRes.status} ${loginRes.statusText}`,

					`Body: ${JSON.stringify(loginBody, null, 2)}`,

					"",

					`GET http://localhost:3000/bearer/opaque/protected-resource`,

					`Status: ${meRes.status} ${meRes.statusText}`,

					`Authorization: Bearer ${token}`,

					`Response: ${JSON.stringify(meBody, null, 2)}`,
				].join("\n");
			} catch (err) {
				result.textContent = `Error: ${(err as Error).message}`;
			}
		})();
	});
}

function setupJwtForm() {
	const form = nonNull(
		document.getElementById("jwt-form"),
		"jwt-form",
	) as HTMLFormElement;
	const result = nonNull(
		document.getElementById("jwt-result"),
		"jwt-result",
	) as HTMLPreElement;
	const resetBtn = nonNull(document.getElementById("jwt-reset"), "jwt-reset");

	resetBtn.addEventListener("click", () => {
		form.reset();
		result.textContent = "No request yet.";
	});

	form.addEventListener("submit", (ev) => {
		ev.preventDefault();
		const username =
			(
				nonNull(
					document.getElementById("jwt-username"),

					"jwt-username",
				) as HTMLInputElement
			).value || "";

		const password =
			(
				nonNull(
					document.getElementById("jwt-password"),

					"jwt-password",
				) as HTMLInputElement
			).value || "";

		(async () => {
			result.textContent = "Requesting...";

			try {
				const loginRes = await fetch("http://localhost:3000/bearer/jwt/login", {
					method: "POST",

					headers: { "Content-Type": "application/json" },

					body: JSON.stringify({ username, password }),
				});

				const loginBody = await loginRes.json().catch(() => ({}));

				if (!loginRes.ok) {
					result.textContent = [
						`POST http://localhost:3000/bearer/jwt/login`,

						`Status: ${loginRes.status} ${loginRes.statusText}`,

						`Body: ${JSON.stringify(loginBody, null, 2)}`,
					].join("\n");

					return;
				}

				const jwt = (loginBody as { jwt?: string }).jwt;

				if (!jwt) {
					result.textContent = [
						`POST http://localhost:3000/bearer/jwt/login`,

						`Status: ${loginRes.status} ${loginRes.statusText}`,

						`Body: ${JSON.stringify(loginBody, null, 2)}`,

						`Error: jwt missing from response`,
					].join("\n");

					return;
				}

				const meRes = await fetch(
					"http://localhost:3000/bearer/jwt/protected-resource",

					{
						method: "GET",

						headers: { Authorization: `Bearer ${jwt}` },
					},
				);

				const meBody = await meRes.json().catch(() => ({}));

				result.textContent = [
					`POST http://localhost:3000/bearer/jwt/login`,

					`Status: ${loginRes.status} ${loginRes.statusText}`,

					`Body: ${JSON.stringify(loginBody, null, 2)}`,

					"",

					`GET http://localhost:3000/bearer/jwt/protected-resource`,

					`Status: ${meRes.status} ${meRes.statusText}`,

					`Authorization: Bearer ${jwt}`,

					`Response: ${JSON.stringify(meBody, null, 2)}`,
				].join("\n");
			} catch (err) {
				result.textContent = `Error: ${(err as Error).message}`;
			}
		})();
	});
}

function main() {
	setupTabs();
	setupBasicForm();
	setupOpaqueForm();
	setupJwtForm();
}

// Defer until DOM is ready
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", main);
} else {
	main();
}
