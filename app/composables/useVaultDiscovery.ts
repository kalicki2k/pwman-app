import { invoke } from '@tauri-apps/api/core';
import type { VaultInfo } from '~/stores/vaults';

export async function listLocalVaults(dirHint?: string) {
    return await invoke<VaultInfo[]>('list_local_vaults', { dirHint })
}
