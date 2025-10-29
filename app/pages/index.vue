<script setup lang="ts">
import { computed, ref } from 'vue'

const vaultStore = useVaults()
const entriesStore = useEntries()

entriesStore.seed();

const hasVaults = computed(() => (vaultStore.all?.length ?? 0) > 0)
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar>
        <template #default>
          <UInput
              icon="i-lucide-search"
              placeholder="Suchen…"
              size="lg"
              class="w-full"
          />
        </template>
        <template #right>
          <div class="flex items-center gap-2">
            <UButton icon="i-lucide-plus" size="sm">Eintrag</UButton>
            <UButton icon="i-lucide-shield-plus" variant="soft" size="sm">Tresor</UButton>
            <UButton icon="i-lucide-download" variant="soft" size="sm">Import</UButton>
          </div>
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <template v-if="!hasVaults">
        <UCard class="mx-2 my-4">
          <div class="flex items-start gap-4">
            <i class="i-lucide-shield text-2xl opacity-70" />
            <div class="flex-1">
              <h2 class="font-semibold">Willkommen bei pwman</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Lege deinen ersten Tresor an, um Einträge sicher zu speichern.
              </p>
              <div class="mt-3 flex gap-2">
                <UButton icon="i-lucide-shield-plus">Tresor erstellen</UButton>
                <UButton icon="i-lucide-download" variant="soft">Importieren</UButton>
              </div>
            </div>
          </div>
        </UCard>
      </template>


      <template v-else>
        <div class="grid grid-cols-3 gap-4 p-2">
          <div class="col-span-3 space-y-4">
            <div class="grid grid-cols-3 gap-3">
              <UCard>
                <div class="text-xs text-gray-500">Einträge</div>
                <div class="text-xl font-semibold">{{ entriesStore.all.length }}</div>
              </UCard>
              <UCard>
                <div class="text-xs text-gray-500">Tags</div>
                <div class="text-xl font-semibold">{{ entriesStore.tags.length }}</div>
              </UCard>
              <UCard>
                <div class="text-xs text-gray-500">Tresore</div>
                <div class="text-xl font-semibold">{{ vaultStore.all.length }}</div>
              </UCard>
            </div>
            <UCard>
              <template #header>
                <span class="font-semibold text-sm">Zuletzt genutzt</span>
              </template>
              <div class="flex flex-wrap gap-2">
                <UButton
                    v-for="e in entriesStore.all.slice(0, 10)"
                    :key="e.id"
                    size="xs"
                    variant="ghost"
                    icon="i-lucide-key-round"
                    :to="`/entries/${e.id}`"
                    class="flex-none"
                >
                  {{ e.label }}
                </UButton>
              </div>
            </UCard>
          </div>
        </div>
      </template>




    </template>
  </UDashboardPanel>
</template>
