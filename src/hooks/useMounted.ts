import { useEffect, useState } from 'react';

/**
 * Hook to detect when a component has mounted on the client.
 * Essential for avoiding hydration mismatches with server-side pre-rendering
 * when dealing with local dates, windows, or dynamic data.
 */
export function useMounted() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return mounted;
}
