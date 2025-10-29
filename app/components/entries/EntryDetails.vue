<script setup lang="ts">
import { computed } from 'vue';
import { useClipboard } from '@vueuse/core';
import { useEntries } from '~/stores/entries';
import type {SelectItem} from "@nuxt/ui";

const entryStore = useEntries();
const selected = computed(() => entryStore.byId(entryStore.selectedId));

const { copy: copyUser, copied: copiedUser } = useClipboard();
const { copy: copyPass, copied: copiedPass } = useClipboard();

const dropdownItems = [[{
  label: 'Löschen',
  icon: 'i-lucide-trash',
  color: 'red',
  onSelect: () => entryStore.remove(selected.value!.id) }]];
const isEditing = ref(false);
const reveal = ref(false);

type Draft = {
  label: string;
  username?: string;
  password?: string;
  notes?: string;
  url?: string;
  tags?: string;
  favorite?: boolean;
  type?: 'login' | 'note' | 'card' | 'identity';
};
const draft = ref<Draft>({ label: '' });
const typeItems = ref<SelectItem[]>([
  {
    label: 'Login',
    value: 'login'
  },
  {
    label: 'Notiz',
    value: 'note'
  },
  {
    label: 'Karte',
    value: 'card'
  },
  {
    label: 'Identität',
    value: 'identity'
  }
]);

function parseTags(s?: string): string[] {
  if (!s) return []
  return Array.from(new Set(s.split(/[,\s]+/).map(t => t.trim()).filter(Boolean)))
}

function stringifyTags(tags?: string[]) {
  return (tags ?? []).join(', ')
}

function edit() {
  if (!selected.value) return;
  isEditing.value = true;
  draft.value = {
    label: selected.value.label ?? '',
    username: selected.value.username ?? '',
    password: selected.value.password ?? '',
    notes: selected.value.notes ?? '',
    url: selected.value.url ?? '',
    tags: stringifyTags(selected.value.tags),
    favorite: !!selected.value.favorite,
    type: (selected.value.type as Draft['type']) ?? 'login'
  };
}

function cancel() {
  isEditing.value = false;
  reveal.value = false;
}

function save() {
  if (!selected.value) return;
  entryStore.update(selected.value.id, {
    label: draft.value.label,
    username: draft.value.username,
    password: draft.value.password,
    notes: draft.value.notes,
    url: draft.value.url,
    tags: parseTags(draft.value.tags),
    favorite: !!draft.value.favorite,
    type: draft.value.type,
  });
  isEditing.value = false;
}
</script>

<template>
  <UDashboardPanel v-if="selected" id="entry-details">
    <UDashboardNavbar>
      <template #leading>
        <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            class="-ms-1.5"
            @click="entryStore.select('')"
        />
      </template>
      <template #title>
        <div class="flex items-center gap-2">
          <template v-if="!isEditing">
            <span class="truncate">{{ selected.label }}</span>
            <UButton icon="i-lucide-edit" variant="ghost" @click="edit" />
          </template>
          <template v-else>
            <UInput v-model="draft.label" placeholder="Titel" class="min-w-[220px]" />
          </template>
        </div>

      </template>
      <template #right>
        <div class="flex items-center gap-2">
          <template v-if="isEditing">
            <UButton icon="i-lucide-x" variant="ghost" color="neutral" @click="cancel" />
            <UButton icon="i-lucide-save" @click="save">Speichern</UButton>
          </template>
          <template v-else>
            <UDropdownMenu :items="dropdownItems">
              <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" />
            </UDropdownMenu>
          </template>
        </div>
      </template>
    </UDashboardNavbar>

    <div class="grid gap-6 p-8">
      <div class="flex items-center gap-3 mb-3">
        <USelect v-if="isEditing" v-model="draft.type" :items="typeItems" class="w-full" />
        <UCheckbox v-if="isEditing" v-model="draft.favorite" label="Favorit" />
      </div>
      <UFormField label="Benutzername">
        <UInput
            v-if="isEditing"
            v-model="draft.username"
            class="w-full"
        />
        <UInput
            v-else
            :model-value="selected.username"
            class="w-full"
            readonly
        >
          <template v-if="selected.username?.length" #trailing>
            <UTooltip text="In Zwischenablage kopieren" :content="{ side: 'right' }">
              <UButton
                  :color="copiedUser ? 'success' : 'neutral'"
                  variant="link"
                  size="sm"
                  :icon="copiedUser ? 'i-lucide-copy-check' : 'i-lucide-copy'"
                  aria-label="Copy to clipboard"
                  @click="copyUser(selected.username)"
              />
            </UTooltip>
          </template>
        </UInput>
      </UFormField>
      <UFormField label="Passwort">
        <UInput
            v-if="isEditing"
            v-model="draft.password"
            :type="reveal ? 'text' : 'password'"
            class="w-full"
        >
          <template #trailing>
            <UButton
                variant="link"
                size="sm"
                :icon="reveal ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                aria-label="Toggle visibility"
                @click="reveal = !reveal"
            />
          </template>
        </UInput>

        <UInput
            v-else
            :model-value="selected.password"
            :type="reveal ? 'text' : 'password'"
            class="w-full"
            readonly
        >
          <template #trailing>
            <UButton
                variant="link"
                size="sm"
                :icon="reveal ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                aria-label="Toggle visibility"
                @click="reveal = !reveal"
            />
            <UTooltip v-if="selected.password?.length" text="In Zwischenablage kopieren" :content="{ side: 'right' }">
              <UButton
                  :color="copiedPass ? 'success' : 'neutral'"
                  variant="link"
                  size="sm"
                  :icon="copiedPass ? 'i-lucide-copy-check' : 'i-lucide-copy'"
                  aria-label="Copy to clipboard"
                  @click="copyPass(selected.password)"
              />
            </UTooltip>
          </template>
        </UInput>
      </UFormField>
      <UFormField label="URL">
        <template v-if="isEditing">
          <UInput v-model="draft.url" class="w-full" placeholder="https://…" />
        </template>
        <template v-else>
          <UInput :model-value="selected.url" class="w-full" readonly>
            <template #trailing v-if="selected.url">
              <UButton variant="link" size="sm" icon="i-lucide-external-link"
                       :to="selected.url" target="_blank" aria-label="Öffnen" />
            </template>
          </UInput>
        </template>
      </UFormField>
      <UFormField label="Tags">
        <template v-if="isEditing">
          <UInput v-model="draft.tags" class="w-full" placeholder="z.B. work, infra" />
        </template>
        <template v-else>
          <div class="flex flex-wrap gap-2">
            <UBadge v-for="t in selected.tags || []" :key="t" variant="soft">{{ t }}</UBadge>
            <span v-if="!(selected.tags?.length)" class="text-muted-foreground text-sm">—</span>
          </div>
        </template>
      </UFormField>
      <UFormField label="Notiz">
        <UTextarea
            v-if="isEditing"
            v-model="draft.notes"
            class="w-full"
            :rows="6"
        />
        <UTextarea
            v-else
            :model-value="selected.notes"
            class="w-full"
            readonly
            :rows="6"
        />
      </UFormField>

      <div class="text-xs text-muted-foreground mt-2">
        Zuletzt geändert: {{ new Date(selected.updatedAt).toLocaleString() }}<br>
        Erstellt: {{ new Date(selected.createdAt).toLocaleString() }}
      </div>
    </div>
  </UDashboardPanel>

  <UDashboardPanel v-else :ui="{ root: 'justify-center' }">
      <UEmpty
          title="Wähle links einen Eintrag aus."
          variant="naked"
          icon="i-lucide-bell"
      />
  </UDashboardPanel>
</template>
