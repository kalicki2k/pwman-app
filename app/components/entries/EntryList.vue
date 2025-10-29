<script setup lang="ts">
import { computed } from 'vue'
import { useEntries } from '~/stores/entries'
import EntryListItem from "~/components/entries/EntryListItem.vue";

const entryStore = useEntries();
const list = computed(() => entryStore.filtered);
</script>

<template>
  <div class="overflow-y-auto divide-y divide-default">
    <div
        v-for="entry in list"
        :key="entry.id"
    >
      <EntryListItem :entry="entry" />
    </div>
  </div>
</template>
