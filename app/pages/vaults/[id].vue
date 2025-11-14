<!-- pages/vaults/[id].vue -->
<script setup lang="ts">
import { computed, onMounted, watch, watchEffect, ref } from 'vue'
import { useVaults } from '~/stores/vaults'
import { useEntries } from '~/stores/entries'
import { LazyEntriesEntryAddModal } from '#components';
import { useSyncApi } from '~/composables/useSyncApi';
import EntryList from '~/components/entries/EntryList.vue';
import EntryDetails from '~/components/entries/EntryDetails.vue';


const route = useRoute();
const vaultStore = useVaults();
const entryStore = useEntries();
const { pull } = useSyncApi();

const toast = useToast();
const overlay = useOverlay();

const modal = overlay.create(LazyEntriesEntryAddModal);

const countAll = computed(() => entryStore.currentVaultEntries.length);
const countFav = computed(() => entryStore.currentVaultEntries.filter(e => e.favorite).length);
const tabItems = computed(() => ([
  { label: `Alle (${countAll.value})`, value: 'all' },
  { label: `Favoriten (${countFav.value})`, value: 'fav' }
]));

const selectedTab = ref<'all' | 'fav'>('all');

async function open() {
  const instance = modal.open();
  const result = await instance.result;

  if (result) {
    const instance = modal.open();
    const result = await instance.result;
    toast.add({
      title: result ? 'Eintrag erstellt' : 'Abgebrochen',
      color: result ? 'success' : 'error',
    });
  }
}

onMounted(async () => {
  vaultStore.seed(); entryStore.seed();
  if (typeof route.params.id === 'string') vaultStore.selectVault(route.params.id);

  console.log(1, vaultStore.current?.id);

  if (vaultStore.current?.id) {
    try {
      const result = await pull(vaultStore.current.id, 0, 50);
      console.log('Pulled events:', result);
    } catch (e) {
      console.error('Pull failed', e);
    }
  }
});

watchEffect(() => {
  entryStore.setOnlyFavorites(selectedTab.value === 'fav');
});

watch(() => route.params.id, (id) => {
  if (typeof id === 'string') vaultStore.selectVault(id);
});

watch(() => vaultStore.current?.id, () => {
  entryStore.query = '';
});
</script>

<template>
  <UDashboardPanel
    id="entry-list"
    :default-size="45"
    :min-size="25"
    :max-size="50"
    resizable
  >
    <UDashboardNavbar title="Einträge">
      <template #default>
        <UInput
            v-model="entryStore.query"
            icon="i-lucide-search"
            placeholder="In diesem Vault suchen…"
            class="w-[260px]"
        />
      </template>

      <template #right>
        <div class="flex items-center gap-3">
          <UTabs
              v-model="selectedTab"
              :items="tabItems"
              :content="false"
              size="xs"
          />
          <UButton icon="i-lucide-plus" @click="open"></UButton>
        </div>
      </template>
    </UDashboardNavbar>
    <EntryList />
  </UDashboardPanel>

  <EntryDetails />
</template>
