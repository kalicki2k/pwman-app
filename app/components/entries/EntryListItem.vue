<script setup lang="ts">
import { useEntries } from "~/stores/entries";
import type { Entry } from "~/stores/entries";

const entryStore = useEntries();

defineProps<{
  entry: Entry,
}>();
</script>
<template>
  <div
      class="p-4 text-sm cursor-pointer border-l-2 transition-colors"
      :class="[
          entry.favorite ? 'text-highlighted' : 'text-toned',
                    entryStore.selectedId && entryStore.selectedId === entry.id
            ? 'border-primary bg-primary/10'
            : 'border-(--ui-bg) hover:border-primary hover:bg-primary/5'
        ]"
      @click="entryStore.select(entry.id)"
  >
    <div class="flex items-center justify-between" :class="[entry.favorite && 'font-semibold']">
      <div class="flex items-center gap-3">
        <UButton
            size="xs"
            color="primary"
            variant="ghost"
            :icon="entry.favorite ? 'i-lucide-star' : 'i-lucide-star-off'"
            @click.stop="entryStore.toggleFavorite(entry.id)"
            :aria-label="entry.favorite ? 'Unfavorisieren' : 'Favorisieren'"
        />

        {{ entry.label }}

        <UBadge v-for="tag in entry.tags" :key="tag" variant="soft" class="shrink-0">{{ tag }}</UBadge>
      </div>
      <div class="flex items-center gap-3">
        <span class="truncate text-sm">{{ entry.username || '-' }}</span>
        <UButton
            v-if="entry.username"
            size="xs" color="primary" variant="ghost" icon="i-lucide-copy"
            :aria-label="`Benutzername kopieren: ${entry.username}`"
        />
      </div>
    </div>
  </div>
</template>