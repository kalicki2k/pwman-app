import { defineNuxtPlugin } from '#app'
import { isClient } from '@vueuse/core'
import { listen } from '@tauri-apps/api/event'
import { tempDir, join } from '@tauri-apps/api/path'
import { useSyncServer } from '~/composables/useSyncServer'

export default defineNuxtPlugin(() => {
    if (!isClient) return;

    if (!('__TAURI_INTERNALS__' in window)) return;

    const { start, stop } = useSyncServer();
    const config = useRuntimeConfig();
    const addr = (config.public?.SYNC_ADDR as string) || '127.0.0.1:8080';

    // let unlistenClose: null | (() => void) = null;

    if (process.env.NODE_ENV === 'development') {
        listen<string>('sync://stdout', event => console.info('[sync]', event.payload)).then();
        listen<string>('sync://stderr', event => console.error('[sync]', event.payload)).then();
        listen<number | null>('sync://terminated', event =>
            console.warn('[sync terminated]', event.payload)
        ).then();
    }
    tempDir()
        .then((dir) => join(dir, 'pwlog'))
        .then((baseDir) => start(addr, baseDir))
        .catch((e) => console.error('failed to start sync server:', e));


    listen('tauri://close-requested', () => {
        stop().catch(e =>
            console.warn('stop on close failed:', e)
        );
    });
        // .then(fn => unlistenClose = fn);

    window.addEventListener('beforeunload', () => stop().then());

    // return {
    //     provide: {
    //         _tauriCleanup: () => { if (unlistenClose) unlistenClose(); }
    //     }
    // }
});
