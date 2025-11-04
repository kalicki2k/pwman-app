import { ref } from 'vue';
import { invoke } from '@tauri-apps/api/core';

const running = ref(false);

export function useSyncServer() {
    async function start(addr: string, baseDir: string) {
        await invoke('start_sync', { addr, baseDir });
        running.value = true;
    }

    async function stop() {
        await invoke('stop_sync');
        running.value = false;
    }

    return { running, start, stop }
}
