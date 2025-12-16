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

export const searchWorks = async (
    query: string,
    type: 'anime' | 'manga' = 'manga',
    filters?: {
        min_score?: number;
        status?: string;
        start_date?: string; // YYYY-MM-DD
        genres?: string; // Comma separated IDs
        order_by?: 'score' | 'popularity' | 'title';
        sort?: 'desc' | 'asc';
    }
) => {
    try {
        const params = new URLSearchParams({
            q: query,
            limit: '24', // Increased limit for discovery
            sfw: 'true',
            ...filters,
        } as any);

        const response = await fetch(`${BASE_URL}/${type}?${params.toString()}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.data as JikanResult[];
    } catch (error) {
        console.error('API Error:', error);
        return [];
    }
};

export const getTopWorks = async (type: 'anime' | 'manga' = 'manga', filter: 'airing' | 'upcoming' | 'bypopularity' | 'favorite' = 'bypopularity') => {
    try {
        const response = await fetch(`${BASE_URL}/top/${type}?filter=${filter}&limit=24`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.data as JikanResult[];
    } catch (error) {
        console.error('API Error:', error);
        return [];
    }
};
