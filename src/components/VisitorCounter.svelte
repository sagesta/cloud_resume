<script lang="ts">
import Icon from "@iconify/svelte";
import { onMount } from "svelte";

// Default count if API fails or is loading
let count: number | string = "---";
let loading = true;

// API URL from environment variables
const apiUrl = import.meta.env.PUBLIC_VISITOR_API_URL;

onMount(async () => {
	if (!apiUrl) {
		console.warn(
			"Visitor API URL not configured. Set PUBLIC_VISITOR_API_URL in .env",
		);
		loading = false;
		count = "N/A";
		return;
	}

	try {
		const response = await fetch(apiUrl);
		if (response.ok) {
			const data = await response.json();
			// Assuming the API returns JSON with a 'count' or 'counter' property, or just the number
			count = data.count || data.counter || data;
		} else {
			console.error("Failed to fetch visitor count:", response.statusText);
		}
	} catch (error) {
		console.error("Error fetching visitor count:", error);
	} finally {
		loading = false;
	}
});
</script>

<div class="flex flex-row text-[var(--primary)] items-center text-md">
    <Icon icon="material-symbols:visibility-outline-rounded" class="text-[1.75rem] mb-1 mr-2" />
    <span class="mr-1">{count}</span> Visitors
</div>
