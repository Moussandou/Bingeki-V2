const BASE_URL = 'https://api.jikan.moe/v4';

export interface JikanResult {
    mal_id: number;
    title: string;
    images: {
        jpg: {
            image_url: string;
            large_image_url: string;
        }
    };
    chapters?: number | null; // API can return null
    episodes?: number | null;
    synopsis: string;
    type: string;
    status: string;
    score?: number | null;
}

export const searchWorks = async (query: string, type: 'anime' | 'manga' = 'manga') => {
    try {
        // delay to avoid rate limiting if typing fast in UI
        const response = await fetch(`${BASE_URL}/${type}?q=${encodeURIComponent(query)}&limit=12&sfw=true`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.data as JikanResult[];
    } catch (error) {
        console.error('API Error:', error);
        return [];
    }
};
