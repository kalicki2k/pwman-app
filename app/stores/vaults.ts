import { defineStore } from 'pinia';
import { invoke } from '@tauri-apps/api/core';

export type Vault = {
    id: string;
    label: string;
    icon?: string;
    to?: string;
    path?: string;
}

export type VaultInfo = {
    path: string;
    file_name: string;
    size: number;
    modified?: number;
    label: string;
}

async function hashPathToId(path: string): Promise<string> {
    try {
        const data = new TextEncoder().encode(path);
        const buf = await crypto.subtle.digest('SHA-1', data);
        const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
        return `vlt_${hex.slice(0, 16)}`
    } catch {
        return crypto.randomUUID()
    }
}

export const useVaults = defineStore('vaults', {
    state: () => ({
        all: [] as Vault[],
        currentId: '' as string,
        isDiscovering: false,
        discoverError: '' as string
    }),
    getters: {
        current(state): Vault | undefined {
            return state.all.find(vault => vault.id === state.currentId)
        }
    },
    actions: {
        async read(dirHint?: string) {
            if (this.isDiscovering) return;

            this.isDiscovering = true;
            this.discoverError = '';

            try {
                const found = await invoke<VaultInfo[]>('list_local_vaults', { dirHint });
                const prevSelectedPath = this.current?.path;
                const previousByPath = new Map(this.all.filter(v => v.path).map(v => [v.path!, v]));
                const next = await Promise.all(found.map(async (info) => {
                    const existing = info.path ? previousByPath.get(info.path) : undefined;
                    const id = existing?.id ?? await hashPathToId(info.path);

                    return {
                        id,
                        label: info.label || info.file_name.replace(/\.json$/i, ''),
                        icon: existing?.icon ?? 'i-lucide-lock',
                        path: info.path,
                        to: `/vaults/${id}`
                    } as Vault;
                }));

                this.all = next;

                const preserved =
                    next.find(v => v.id === this.currentId) ??
                    (prevSelectedPath ? next.find(v => v.path === prevSelectedPath) : undefined) ??
                    next[0];

                this.currentId = preserved?.id ?? '';
            } catch (error) {
                this.discoverError = error instanceof Error ? error.message : String(error);
                throw error;
            } finally {
                this.isDiscovering = false;
            }
        },
        seed() {
            if (this.all.length) return;
            const v1: Vault = { id: crypto.randomUUID(), label: 'Persönlich', icon: 'i-lucide-lock' };
            const v2: Vault = { id: crypto.randomUUID(), label: 'Work', icon: 'i-lucide-briefcase' };
            this.all = [v1, v2].map(i => {
                i.to = `/vaults/${i.id}`;
                return i;
            });
            this.currentId = v1.id;
        },
        selectVault(id: string) {
            if (this.all.some(v => v.id === id)) this.currentId = id;
        },
        /*addVault(name: string, emoji?: string) {
            const vault: Vault = { id: crypto.randomUUID(), label, icon, createdAt: now(), updatedAt: now() };
            this.all.push(vault);
            this.currentId = vault.id;
        },
        renameVault(id: string, name: string) {
            const vault = this.all.find(x => x.id === id);
            if (vault) { vault.name = name; vault.updatedAt = now() };
        },
        removeVault(id: string) {
            const idx = this.all.findIndex(v => vault.id === id);
            if (idx < 0) return;
            this.all.splice(idx, 1);
            if (this.currentId === id) this.currentId = this.all[0]?.id ?? '';
        }*/
    }
})
