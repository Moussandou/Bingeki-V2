/**
 * Validates if an image source URL is safe to use in an img tag.
 * Allows ONLY data:image URIs and http/https URLs.
 * Rejects javascript: URIs and other potentially dangerous schemes.
 */
export const isValidImageSrc = (src: string): boolean => {
    if (!src) return false;

    // Allow data URIs for image previews (from file uploads)
    if (src.startsWith('data:image/')) return true;

    try {
        const url = new URL(src);
        // Strictly allow only http and https protocols
        return ['http:', 'https:'].includes(url.protocol);
    } catch {
        // If URL parsing fails, it's not a valid URL
        return false;
    }
};
