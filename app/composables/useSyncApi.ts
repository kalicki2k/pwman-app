import { useSyncServer } from '~/composables/useSyncServer';
import { useEntries } from '~/stores/entries';

export function useSyncApi() {
    const { baseUrl } = useSyncServer();
    const entryStore = useEntries();

    async function pull(vaultId: string, since = 0, limit = 500) {
        const response = await fetch(`${baseUrl.value}/v1/vaults/${vaultId}/events?since=${since}&limit=${limit}`);
        if (!response.ok) throw new Error(`pull ${response.status}`);

        const data = await response.json();

        console.log('data:', data);

        return data;
    }

    async function push(vaultId: string, body: any) {
        const res = await fetch(`${baseUrl.value}/v1/vaults/${vaultId}/events`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`push ${res.status}`);
        return res.json();
    }

    return { pull, push };
}
