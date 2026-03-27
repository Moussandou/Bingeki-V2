/**
 * Utility to proxy image URLs that are known to have strict hotlinking or CORS policies.
 * Primarily used for MyAnimeList (MAL) images.
 */

// If we want to disable proxying and use referrerPolicy="no-referrer" directly in components
// we keep this list empty or just disable the check.
const PROXIED_DOMAINS: string[] = [];

/**
 * Checks if a URL should be proxied and returns the proxied URL if necessary.
 * @param url The original image URL
 * @returns The proxied URL or the original if no proxy is needed
 */
export const getProxiedImageUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined;
    
    // Simplest version: just return the original URL.
    // We rely on <img referrerpolicy="no-referrer" /> in the component to bypass hotlinking.
    return url;
};
