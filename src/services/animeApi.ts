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
    trailer?: {
        youtube_id: string;
        url: string;
        embed_url: string;
        images: {
            image_url: string;
            large_image_url: string;
            maximum_image_url: string;
        }
    };
    chapters?: number | null; // API can return null
    episodes?: number | null;
    synopsis: string;
    type: string;
    status: string;
    score?: number | null;
    studios?: { mal_id: number; type: string; name: string; url: string }[];
    genres?: { mal_id: number; type: string; name: string; url: string }[];
    rating?: string;
    season?: string;
    year?: number;
    duration?: string;
    rank?: number;
    popularity?: number;
    source?: string;
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

export const getTopWorks = async (
    type: 'anime' | 'manga' = 'manga',
    filter: 'airing' | 'upcoming' | 'bypopularity' | 'favorite' = 'bypopularity',
    limit: number = 24
) => {
    try {
        const response = await fetch(`${BASE_URL}/top/${type}?filter=${filter}&limit=${limit}&sfw=true`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.data as JikanResult[];
    } catch (error) {
        console.error('API Error:', error);
        return [];
    }
};

export const getSeasonalAnime = async (limit: number = 24) => {
    try {
        // Fetches current season's anime
        const response = await fetch(`${BASE_URL}/seasons/now?limit=${limit}&sfw=true`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.data as JikanResult[];
    } catch (error) {
        console.error('API Error:', error);
        return [];
    }
};

export interface JikanEpisode {
    mal_id: number;
    url: string;
    title: string;
    title_japanese: string | null;
    title_romanji: string | null;
    aired: string | null;
    score: number | null;
    filler: boolean;
    recap: boolean;
    forum_url: string | null;
}

export const getAnimeEpisodes = async (id: number, page: number = 1) => {
    try {
        const response = await fetch(`${BASE_URL}/anime/${id}/episodes?page=${page}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return {
            data: data.data as JikanEpisode[],
            pagination: data.pagination
        };
    } catch (error) {
        console.error('API Error:', error);
        return { data: [], pagination: { has_next_page: false } };
    }
};

export const getAnimeEpisodeDetails = async (id: number, episodeId: number) => {
    try {
        const response = await fetch(`${BASE_URL}/anime/${id}/episodes/${episodeId}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.data as { synopsis: string; duration: number; };
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
};

export const getWorkDetails = async (id: number, type: 'anime' | 'manga'): Promise<JikanResult> => {
    try {
        // Simple delay to help with rate limiting if called in a loop client-side
        await new Promise(resolve => setTimeout(resolve, 350)); // ~3 requests/sec limit

        const response = await fetch(`${BASE_URL}/${type}/${id}`);
        if (!response.ok) {
            // Handle 429 Too Many Requests specifically if needed, but for now generic error
            if (response.status === 429) {
                console.warn(`Rate limit hit for ${type} ${id}, waiting longer...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                return getWorkDetails(id, type); // Retry once
            }
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.data as JikanResult;
    } catch (error) {
        console.error(`API Error fetching ${type} ${id}:`, error);
        throw error;
    }
};

export interface JikanCharacter {
    character: {
        mal_id: number;
        url: string;
        images: {
            jpg: {
                image_url: string;
            };
        };
        name: string;
    };
    role: string;
    favorites: number;
}

export const getWorkCharacters = async (id: number, type: 'anime' | 'manga') => {
    try {
        const response = await fetch(`${BASE_URL}/${type}/${id}/characters`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        // Return top 10 characters to keep UI clean
        return (data.data as JikanCharacter[]).slice(0, 10);
    } catch (error) {
        console.error('API Error:', error);
        return [];
    }
};

export interface JikanRelation {
    relation: string;
    entry: {
        mal_id: number;
        type: string;
        name: string;
        url: string;
    }[];
}

export const getWorkRelations = async (id: number, type: 'anime' | 'manga') => {
    try {
        const response = await fetch(`${BASE_URL}/${type}/${id}/relations`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.data as JikanRelation[];
    } catch (error) {
        console.error('API Error:', error);
        return [];
    }
};
