import { defineStore } from 'pinia'
import { useVaults } from './vaults'

export type Entry = {
    id: string;
    vaultId: string;
    label: string;
    username?: string,
    password?: string,
    url?: string,
    notes?: string,
    favorite?: boolean,
    type: 'login' | 'note' | 'card' | 'identity',
    tags?: string[],
    createdAt: string,
    updatedAt: string,
}

function now() { return new Date().toISOString() }

export const useEntries = defineStore('entries', {
    state: () => ({
        all: [] as Entry[],
        selectedId: '',
        query: '',
        onlyFavorites: false,
        activeTag: '',
    }),
    getters: {
        byId: (state) => (id: string) => state.all.find(entity => entity.id === id),
        currentVaultId(): string | undefined {
            const vaultStore = useVaults();
            return vaultStore.current?.id;
        },
        currentVaultEntries(state): Entry[] {
            if (!this.currentVaultId) return [];
            return state.all.filter(entry => entry.vaultId === this.currentVaultId);
        },
        count(): number {
            return this.currentVaultEntries.length;
        },
        tags(): string[] {
            const set = new Set<string>();
            for (const entry of this.currentVaultEntries) for (const tag of entry.tags ?? []) set.add(tag);
            return [...set].sort((a, b) => a.localeCompare(b));
        },
        filtered(state): Entry[] {
            let list = this.currentVaultEntries.slice()

            if (state.query.trim()) {
                const needle = state.query.toLowerCase();
                list = list.filter(e => [e.label, e.username, e.url, e.notes]
                        .filter(Boolean)
                        .some(v => (v as string).toLowerCase().includes(needle))
                );
            }

            if (state.onlyFavorites) list = list.filter(e => e.favorite);

            if (state.activeTag) list = list.filter(e => e.tags?.includes(state.activeTag))

            return list
        },
    },
    actions: {
        seed() {
            const vaultStore = useVaults();
            vaultStore.seed();
            if (!vaultStore.current) return;

            if (this.all.length) return;
            const [personal, work] = vaultStore.all;

            this.all.push(
                {
                    id: crypto.randomUUID(),
                    vaultId: personal!.id,
                    label: 'GitHub',
                    url: 'https://github.com',
                    username: 'me',
                    password: 'secret',
                    type: 'login',
                    tags: ['work'],
                    favorite: true,
                    createdAt: now(),
                    updatedAt: now(),
                },
                {
                    id: crypto.randomUUID(),
                    vaultId: personal!.id,
                    label: 'Gmail',
                    url: 'https://mail.google.com',
                    username: 'me@gmail.com',
                    password: 'p@ssword123',
                    type: 'login',
                    tags: ['personal', 'mail'],
                    favorite: true,
                    createdAt: now(),
                    updatedAt: now(),
                },
                {
                    id: crypto.randomUUID(),
                    vaultId: personal!.id,
                    label: 'Notion',
                    url: 'https://notion.so',
                    username: 'me@work.com',
                    password: 'NoteKing42!',
                    type: 'login',
                    tags: ['work', 'productivity'],
                    favorite: false,
                    createdAt: now(),
                    updatedAt: now(),
                },
                {
                    id: crypto.randomUUID(),
                    vaultId: personal!.id,
                    label: 'AWS Console',
                    url: 'https://aws.amazon.com/console/',
                    username: 'root@company.com',
                    password: 'Sup3r$ecure!',
                    type: 'login',
                    tags: ['infra', 'cloud'],
                    favorite: true,
                    createdAt: now(),
                    updatedAt: now(),
                },
                {
                    id: crypto.randomUUID(),
                    vaultId: personal!.id,
                    label: 'Hetzner Cloud',
                    url: 'https://console.hetzner.cloud/',
                    username: 'admin',
                    password: 'HetznerRocks!',
                    type: 'login',
                    tags: ['infra', 'work'],
                    favorite: false,
                    createdAt: now(),
                    updatedAt: now(),
                },
                {
                    id: crypto.randomUUID(),
                    vaultId: personal!.id,
                    label: 'Spotify',
                    url: 'https://spotify.com',
                    username: 'musiclover@mail.com',
                    password: 's0und$good!',
                    type: 'login',
                    tags: ['personal', 'media'],
                    favorite: false,
                    createdAt: now(),
                    updatedAt: now(),
                },
                {
                    id: crypto.randomUUID(),
                    vaultId: personal!.id,
                    label: 'Figma',
                    url: 'https://figma.com',
                    username: 'design@agency.com',
                    password: 'Creat1vePass!',
                    type: 'login',
                    tags: ['work', 'design'],
                    favorite: false,
                    createdAt: now(),
                    updatedAt: now(),
                },
                {
                    id: crypto.randomUUID(),
                    vaultId: personal!.id,
                    label: 'LinkedIn',
                    url: 'https://linkedin.com',
                    username: 'me@career.com',
                    password: 'n3tw0rk!ng',
                    type: 'login',
                    tags: ['personal', 'social'],
                    favorite: true,
                    createdAt: now(),
                    updatedAt: now(),
                },
                {
                    id: crypto.randomUUID(),
                    vaultId: personal!.id,
                    label: 'Bitwarden',
                    url: 'https://vault.bitwarden.com',
                    username: 'secure@mail.com',
                    password: 'M@nager42!',
                    type: 'login',
                    tags: ['security'],
                    favorite: false,
                    createdAt: now(),
                    updatedAt: now(),
                },
                {
                    id: crypto.randomUUID(),
                    vaultId: personal!.id,
                    label: 'OpenAI',
                    url: 'https://platform.openai.com',
                    username: 'ai@future.com',
                    password: 'GPT4Ever!',
                    type: 'login',
                    tags: ['dev', 'api'],
                    favorite: true,
                    createdAt: now(),
                    updatedAt: now(),
                },
            );

            const first = this.currentVaultEntries[0];
            this.selectedId = first?.id ?? '';
        },
        select(id: string): void {
            this.selectedId = id;
        },
        setActiveTag(tag: string): void {
            this.activeTag = tag;
        },
        setOnlyFavorites(value: boolean) {
            this.onlyFavorites = value;
        },
        toggleFavorite(id: string) {
            const entry = this.all.find(x => x.id === id);
            if (!entry) return;
            entry.favorite = !entry.favorite;
            entry.updatedAt = now();
        },
        add(partial: Partial<Entry>) {
            if (!this.currentVaultId) throw new Error('Kein aktiver Vault');
            const e = {
                id: crypto.randomUUID(),
                vaultId: this.currentVaultId,
                type: partial.type ?? 'login',
                label: partial.label?.trim() || 'Neuer Eintrag',
                username: partial.username,
                password: partial.password,
                url: partial.url,
                notes: partial.notes,
                tags: partial.tags ?? [],
                favorite: !!partial.favorite,
                createdAt: now(),
                updatedAt: now()
            } as Entry;
            this.all.unshift(e);
            this.selectedId = e.id;
            return e
        },
        update(id: string, patch: Partial<Entry>) {
            const entry = this.all.find(x => x.id === id);
            if (!entry) return;
            Object.assign(entry, patch);
            entry.updatedAt = now();
        },
        remove(id: string) {
            const index = this.all.findIndex(x => x.id === id);
            if (index < 0) return;
            this.all.splice(index, 1);
            if (this.selectedId === id) {
                this.selectedId = this.filtered[0]?.id ?? '';
            }
        },
        //
        // moveToVault(id: string, targetVaultId: string) {
        //     const e = this.all.find(x => x.id === id)
        //     if (!e) return
        //     e.vaultId = targetVaultId
        //     e.updatedAt = now()
        // },
        //
        //
        // // UI helpers
        // setQuery(q: string) { this.query = q },
        // setFilterTag(tag: string | null) { this.tag = tag },
        // setOnlyFavs(v: boolean) { this.onlyFavs = v },
        // setSort(s: SortKey) { this.sortBy = s },
        // select(id: string) { this.selectedId = id }
    }
})
