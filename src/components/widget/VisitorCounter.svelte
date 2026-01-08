<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from '@iconify/svelte';

  // Default API URL
  const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:7071/api';

  let count = 0;
  let isLoading = true;

  onMount(async () => {
    try {
      const response = await fetch(`${API_URL}/visitor_count`);
      if (response.ok) {
        const data = await response.json();
        count = data.count || 0;
      }
    } catch (e) {
      console.error('Failed to fetch visitor count', e);
    } finally {
      isLoading = false;
    }
  });
</script>

<div class="flex items-center gap-2 rounded-lg bg-black/5 dark:bg-white/10 px-3 py-1.5 text-sm font-medium text-black/50 dark:text-white/50" aria-label="Visitor Count">
  <Icon icon="fa6-regular:eye" class="text-base" />
  <span>{isLoading ? '...' : count}</span>
</div>
