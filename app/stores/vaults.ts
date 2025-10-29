import { defineStore } from 'pinia'

export type Vault = {
    id: string;
    label: string;
    icon?: string;
    to?: string;
}

export const useVaults = defineStore('vaults', {
    state: () => ({
        all: [] as Vault[],
        currentId: '' as string
    }),
    getters: {
        current(state): Vault | undefined {
            return state.all.find(vault => vault.id === state.currentId)
        }
    },
    actions: {
        seed() {
            if (this.all.length) return
            const v1: Vault = { id: crypto.randomUUID(), label: 'Persönlich', icon: 'i-lucide-lock' };
            const v2: Vault = { id: crypto.randomUUID(), label: 'Work', icon: 'i-lucide-briefcase' };
            this.all = [v1, v2].map(i => {
                i.to = `/vaults/${i.id}`;
                return i;
            });
            this.currentId = v1.id
        },
        selectVault(id: string) {
            if (this.all.some(v => v.id === id)) this.currentId = id
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
