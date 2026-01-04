<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from '@iconify/svelte';

  export let id: string;
  // Default API URL - can be overridden by environment variable
  const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:7071/api';

  let likes = 0;
  let hasLiked = false;
  let isLoading = true;

  onMount(async () => {
    // Check local storage to see if user already liked this post
    const storedLikes = localStorage.getItem(`liked_${id}`);
    if (storedLikes) {
      hasLiked = true;
    }

    try {
      // Fetch current likes
      const response = await fetch(`${API_URL}/likes?id=${id}`);
      if (response.ok) {
        const data = await response.json();
        likes = data.likes || 0;
      }
    } catch (e) {
      console.error('Failed to fetch likes', e);
    } finally {
      isLoading = false;
    }
  });

  async function handleLike() {
    if (hasLiked) return;

    // Optimistic UI update
    likes += 1;
    hasLiked = true;
    localStorage.setItem(`liked_${id}`, 'true');

    try {
      const response = await fetch(`${API_URL}/likes?id=${id}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        // Revert on failure
        likes -= 1;
        hasLiked = false;
        localStorage.removeItem(`liked_${id}`);
        console.error('Failed to update likes');
      }
    } catch (e) {
      // Revert on failure
      likes -= 1;
      hasLiked = false;
      localStorage.removeItem(`liked_${id}`);
        console.error('Failed to update likes', e);
    }
  }
</script>

<div class="flex items-center justify-center py-8">
  <button
    on:click={handleLike}
    class="group flex items-center gap-2 rounded-full px-4 py-2 transition-all duration-300
    {hasLiked 
      ? 'bg-[var(--primary)] text-white shadow-lg scale-105' 
      : 'bg-black/5 dark:bg-white/10 text-black/50 dark:text-white/50 hover:bg-[var(--primary)] hover:text-white hover:scale-105 active:scale-95'}"
    disabled={isLoading || hasLiked}
    aria-label="Like this post"
  >
    <Icon icon="material-symbols:favorite-rounded" class="text-xl {hasLiked ? 'animate-pulse' : ''}" />
    <span class="font-bold text-lg">{likes}</span>
  </button>
</div>
