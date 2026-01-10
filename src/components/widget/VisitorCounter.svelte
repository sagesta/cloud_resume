<script lang="ts">
  import { onMount } from "svelte";
  import Icon from "@iconify/svelte";

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
        now - parseInt(lastVisit, 10) > COOLDOWN_HOURS * 60 * 60 * 1000;

      if (shouldIncrement) {
        // Call API once - it will increment AND return the new count
        const response = await fetch(`${API_URL}/visitor_count`);
        if (response.ok) {
          const data = await response.json();
          count = data.count || 0;
          // Store the count in localStorage for display when we don't increment
          localStorage.setItem("portfolio_visitor_count", count.toString());
        }
        // Update last visit time
        localStorage.setItem("portfolio_last_visit", now.toString());
      } else {
        // Don't call API - just show the cached count to avoid incrementing
        const cachedCount = localStorage.getItem("portfolio_visitor_count");
        count = cachedCount ? parseInt(cachedCount, 10) : 0;
      }
    } catch (e) {
      console.error("Failed to fetch visitor count", e);
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
