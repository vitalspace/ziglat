<script lang="ts">
  export let text: string;
  export let url: string;
  export let hidden: boolean;
</script>

{#if hidden}
  <a class="hidden" href={url}>
    {text}
  </a>
{:else}
  <a class="bg-purple-500 rounded-md border block text-center py-2 hover:bg-purple-800 transition-all" href={url}>
    {text}
  </a>
{/if}
