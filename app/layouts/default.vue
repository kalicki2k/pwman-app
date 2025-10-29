<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';

const entryStore = useEntries();
const vaultStore = useVaults();
vaultStore.seed();

const vaultItems = computed<NavigationMenuItem[]>(() => ([
  { label: 'Alle Tresore', type: 'label' },
  ...vaultStore.all
]));

const items: NavigationMenuItem[] = [{
  label: 'Feedback',
  icon: 'i-lucide-message-circle',
  to: 'https://github.com/kalicki2k/pwman-app/dashboard',
  target: '_blank'
}, {
  label: 'Help & Support',
  icon: 'i-lucide-info',
  to: 'https://github.com/kalicki2k/pwman-app',
  target: '_blank'
}];


</script>
<template>
  <UDashboardGroup>
    <UDashboardSidebar>
      <template #header>
        <NuxtLink to="/" class="flex items-end gap-0.5">
          <Logo/>
        </NuxtLink>
      </template>

      <template #default>
        <UNavigationMenu
            :items="vaultItems"
            orientation="vertical"
        />
        <div>
          <div class="w-full flex items-center gap-1.5 font-semibold text-xs/5 text-highlighted px-2.5 py-1.5">
            <span class="truncate">Alle Tags</span>
          </div>
          <div class="flex flex-wrap items-center gap-1.5">
            <UButton
                v-for="tag in entryStore.tags"
                :key="tag"
                size="xs"
                :color="entryStore.activeTag === tag ? 'primary' : 'neutral'"
                variant="soft"
                class="flex-none"
                @click="entryStore.setActiveTag(tag)"
            >
              {{ tag }}
            </UButton>
          </div>
        </div>

        <UNavigationMenu
            :items="items"
            orientation="vertical"
            class="mt-auto"
        />
      </template>
    </UDashboardSidebar>
    <slot />
  </UDashboardGroup>
</template>
