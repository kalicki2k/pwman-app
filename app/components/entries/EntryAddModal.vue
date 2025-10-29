<script setup lang="ts">
import { useEntries } from '~/stores/entries';
import type { SelectItem } from '@nuxt/ui';

const entryStore = useEntries();
const emit = defineEmits<{ close: [boolean] }>();

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
const reveal = ref(false);
const form = ref({
  label: '',
  username: '',
  password: '',
  url: '',
  notes: '',
  tags: '' as string,
  favorite: false,
  type: 'login' as 'login' | 'note' | 'card' | 'identity'
});

function parseTags(s: string): string[] {
  return Array.from(new Set(s.split(/[,\s]+/).map(t => t.trim()).filter(Boolean)))
}

function save() {
  if (!form.value.label.trim()) return
  entryStore.add({
    label: form.value.label,
    username: form.value.username || undefined,
    password: form.value.password || undefined,
    url: form.value.url || undefined,
    notes: form.value.notes || undefined,
    tags: parseTags(form.value.tags),
    favorite: form.value.favorite,
    type: form.value.type
  });
  emit('close', true);
}

function generatePassword(len = 20) {
  const sets = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!$%&()*+,-./:;<=>?@[]^_{|}~'
  form.value.password = Array.from({ length: len }, () => sets[Math.floor(Math.random() * sets.length)]).join('')
}

const canSave = computed(() => !!form.value.label.trim())

</script>

<template>
  <UModal
      title="Neuer Eintrag"
      :close="{ onClick: () => emit('close', false) }"
  >
    <template #body>
      <UFormField label="Titel" class="mb-3" required>
        <UInput class="w-full" v-model="form.label" placeholder="z.B. GitHub" autofocus />
      </UFormField>
      <div class="flex items-center gap-3 mb-3">
        <USelect v-model="form.type" :items="typeItems" class="w-full" />
        <UCheckbox v-model="form.favorite" label="Favorit" />
      </div>
      <UFormField label="Benutzername" class="mb-3">
        <UInput class="w-full" v-model="form.username" />
      </UFormField>
      <UFormField label="Passwort" class="mb-3">
        <UInput class="w-full" v-model="form.password" :type="reveal ? 'text' : 'password'">
          <template #trailing>
            <UButton variant="link" size="sm"
                     :icon="reveal ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                     @click="reveal = !reveal" />
            <UButton variant="link" size="sm" icon="i-lucide-sparkles" @click="generatePassword()"></UButton>
          </template>
        </UInput>
      </UFormField>
      <UFormField label="URL" class="mb-3">
        <UInput class="w-full" v-model="form.url" placeholder="https://…" />
      </UFormField>
      <UFormField label="Tags" class="mb-3">
        <UInput class="w-full" v-model="form.tags" placeholder="z.B. work, infra" />
      </UFormField>
      <UFormField label="Notizen">
        <UTextarea class="w-full" v-model="form.notes" :rows="4" />
      </UFormField>
    </template>
    <template #footer>
      <div class="flex gap-2">
        <UButton color="neutral" label="Abbrechen" @click="emit('close', false)" />
        <UButton label="Speichern" @click="save" />
      </div>
    </template>
  </UModal>
</template>
