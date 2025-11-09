import { ref } from 'vue';
import { invoke } from '@tauri-apps/api/core';
import { listen } from "@tauri-apps/api/event";

const running = ref(false);
const baseUrl = ref<string>('');

export function useSyncServer() {
    async function start(addr: string, baseDir: string) {
        baseUrl.value = `http://${addr}`;

        const offReady = await listen<string>('sync://ready', (e) => {
            if (e.payload === addr) running.value = true;
        });

        try {
            await invoke('start_sync', { addr, baseDir });
        } catch (e) {
            offReady();
            throw e;
        }
    }

    async function stop() {
        await invoke('stop_sync');
        running.value = false;
        baseUrl.value = '';
    }

    return { running, baseUrl, start, stop }
}
