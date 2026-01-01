export default {
	async fetch(request, env, _ctx) {
		const url = new URL(request.url);

		// Handle debug route
		if (url.pathname === "/api/debug") {
			return new Response(
				JSON.stringify(
					{
						AZURE_STORAGE_URL: env.AZURE_STORAGE_URL,
						AZURE_FUNCTION_URL: env.AZURE_FUNCTION_URL,
						TargetHostname: new URL(env.AZURE_STORAGE_URL).hostname,
						Message:
							"If you see this, the Worker is running and variables are loaded.",
					},
					null,
					2,
				),
				{
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Handle API requests for visitor count
		if (url.pathname === "/api/visitorCount") {
			let targetFuncUrl;

			if (request.method === "POST") {
				targetFuncUrl = env.AZURE_INCREMENT_URL;
				if (!targetFuncUrl) {
					return new Response(
						"Error: AZURE_INCREMENT_URL is not set in Cloudflare.",
						{ status: 500 },
					);
				}
			} else {
				// Default to GET / Read-Only
				targetFuncUrl = env.AZURE_FUNCTION_URL;
				if (!targetFuncUrl) {
					return new Response(
						"Error: AZURE_FUNCTION_URL is not set in Cloudflare.",
						{ status: 500 },
					);
				}
			}

			// Forward request to appropriate Azure Function
			try {
				const funcResponse = await fetch(targetFuncUrl, {
					method: request.method,
					headers: request.headers,
				});
				// Re-wrap response to handle CORS if needed (though proxying solves most)
				const newHeaders = new Headers(funcResponse.headers);
				newHeaders.set("Access-Control-Allow-Origin", "*");
				return new Response(funcResponse.body, {
					status: funcResponse.status,
					headers: newHeaders,
				});
			} catch (e) {
				return new Response(`Error fetching from function: ${e.message}`, {
					status: 502,
				});
			}
		}

		// Standard Static Site Proxy Logic
		const AZURE_ORIGIN =
			"https://storagesamueladebodunv2.z19.web.core.windows.net/";

		if (!AZURE_ORIGIN) {
			return new Response(
				"Error: AZURE_STORAGE_URL environment variable is not set.",
				{ status: 500 },
			);
		}

		// Construct the new URL
		const targetUrl = new URL(url.pathname + url.search, AZURE_ORIGIN);

		// Handle root request -> index.html
		if (targetUrl.pathname === "/" || targetUrl.pathname === "") {
			targetUrl.pathname = "/index.html";
		}

		// Create a mutable request to forward
		const newRequest = new Request(targetUrl, {
			method: request.method,
			headers: request.headers,
			body: request.body,
			redirect: "manual",
		});

		// Force Host header to match the origin
		newRequest.headers.set("Host", targetUrl.hostname);

		try {
			const response = await fetch(newRequest);
			return response;
		} catch (e) {
			return new Response(`Error fetching from backend: ${e.message}`, {
				status: 502,
			});
		}
	},
};
