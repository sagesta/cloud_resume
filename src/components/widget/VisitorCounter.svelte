<script lang="ts">
import Icon from "@iconify/svelte";
import { onMount } from "svelte";

// Default API URL
const API_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:7071/api";

let count = 0;
let isLoading = true;

onMount(async () => {
	try {
		const COOLDOWN_HOURS = 24;
		const lastVisit = localStorage.getItem("portfolio_last_visit");
		const now = Date.now();

		// Check if we should count this visit
		const shouldIncrement =
			!lastVisit ||
			now - Number.parseInt(lastVisit, 10) > COOLDOWN_HOURS * 60 * 60 * 1000;

		if (shouldIncrement) {
			// Call API to increment and get the new count
			const response = await fetch(`${API_URL}/visitor_count`);
			if (response.ok) {
				const data = await response.json();
				count = data.count || 0;
				// Store the count in localStorage for offline display
				localStorage.setItem("portfolio_visitor_count", count.toString());
			}
			// Update last visit time
			localStorage.setItem("portfolio_last_visit", now.toString());
		} else {
			// Call API in read-only mode to get count without incrementing
			const response = await fetch(`${API_URL}/visitor_count?increment=false`);
			if (response.ok) {
				const data = await response.json();
				count = data.count || 0;
				// Update cached count
				localStorage.setItem("portfolio_visitor_count", count.toString());
			} else {
				// Fallback to cached count if API fails
				const cachedCount = localStorage.getItem("portfolio_visitor_count");
				count = cachedCount ? Number.parseInt(cachedCount, 10) : 0;
			}
		}
	} catch (e) {
		console.error("Failed to fetch visitor count", e);
		// Fallback to cached count on error
		const cachedCount = localStorage.getItem("portfolio_visitor_count");
		count = cachedCount ? Number.parseInt(cachedCount, 10) : 0;
	} finally {
		isLoading = false;
	}
});
</script>

<div
  class="flex items-center gap-2 rounded-lg bg-black/5 dark:bg-white/10 px-3 py-1.5 text-sm font-medium text-black/50 dark:text-white/50"
  aria-label="Visitor Count"
>
  <Icon icon="fa6-regular:eye" class="text-base" />
  <span>{isLoading ? "..." : count}</span>
</div>
