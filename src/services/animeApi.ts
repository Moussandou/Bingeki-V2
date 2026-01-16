const BASE_URL = 'https://api.jikan.moe/v4';

// Jikan API Status Response
export interface JikanStatusResponse {
    status: 'online' | 'offline' | 'error';
    responseTime?: number; // in milliseconds
    message?: string;
    timestamp: number;
}

// Check Jikan API status
export const checkJikanStatus = async (): Promise<JikanStatusResponse> => {
    const startTime = Date.now();
    try {
        const response = await fetch(`${BASE_URL}/anime/1`, {
            method: 'HEAD', // Use HEAD to minimize data transfer
            signal: AbortSignal.timeout(5000) // 5 second timeout
        });

        const responseTime = Date.now() - startTime;

        if (response.ok) {
            return {
                status: 'online',
                responseTime,
                timestamp: Date.now()
            };
        } else {
            return {
                status: 'error',
                responseTime,
                message: `HTTP ${response.status}: ${response.statusText}`,
                timestamp: Date.now()
            };
        }
    } catch (error) {
        const responseTime = Date.now() - startTime;
        return {
            status: 'offline',
            responseTime,
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: Date.now()
        };
    }
};


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
    broadcast?: {
        day?: string;
        time?: string;
        timezone?: string;
        string?: string;
    };
}

export const searchWorks = async (
    query: string,
    type: 'anime' | 'manga' = 'manga',
    filters?: {
        min_score?: number;
        status?: string;
        genres?: string; // Comma separated IDs
        order_by?: 'score' | 'popularity' | 'title';
        sort?: 'desc' | 'asc';
        rating?: 'g' | 'pg' | 'pg13' | 'r17' | 'r' | 'rx';
        start_date?: string; // YYYY-MM-DD
        end_date?: string;
        producers?: string; // Comma separated IDs
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

export interface JikanVoiceActor {
    person: {
        mal_id: number;
        url: string;
        images: {
            jpg: {
                image_url: string;
            };
        };
        name: string;
    };
    language: string;
}

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
    voice_actors: JikanVoiceActor[];
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

export interface JikanRecommendation {
    entry: {
        mal_id: number;
        url: string;
        images: {
            jpg: {
                image_url: string;
                large_image_url: string;
            };
        };
        title: string;
    };
    votes: number;
}

export const getWorkRecommendations = async (id: number, type: 'anime' | 'manga') => {
    try {
        const response = await fetch(`${BASE_URL}/${type}/${id}/recommendations`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return (data.data as JikanRecommendation[]).slice(0, 12); // Limit to 12 recs
    } catch (error) {
        console.error('API Error:', error);
        return [];
    }
};

export interface JikanPicture {
    jpg: {
        image_url: string;
        large_image_url: string;
    };
}

export const getWorkPictures = async (id: number, type: 'anime' | 'manga') => {
    try {
        const response = await fetch(`${BASE_URL}/${type}/${id}/pictures`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.data as JikanPicture[];
    } catch (error) {
        console.error('API Error:', error);
        return [];
    }
};

export interface JikanTheme {
    openings: string[];
    endings: string[];
}

export const getWorkThemes = async (id: number): Promise<JikanTheme> => {
    try {
        const response = await fetch(`${BASE_URL}/anime/${id}/themes`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.data as JikanTheme;
    } catch (error) {
        console.error('API Error:', error);
        return { openings: [], endings: [] };
    }
};

export interface JikanStatistics {
    watching: number;
    completed: number;
    on_hold: number;
    dropped: number;
    plan_to_watch: number;
    total: number;
    scores: {
        score: number;
        percentage: number;
        votes: number;
    }[];
}

export const getWorkStatistics = async (id: number, type: 'anime' | 'manga') => {
    try {
        const response = await fetch(`${BASE_URL}/${type}/${id}/statistics`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.data as JikanStatistics;
    } catch (error) {
        console.error(`API Error fetching ${type} ${id} statistics:`, error);
        throw error;
    }
};

export interface JikanStreaming {
    name: string;
    url: string;
}

export const getAnimeStreaming = async (id: number) => {
    try {
        const response = await fetch(`${BASE_URL}/anime/${id}/streaming`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.data as JikanStreaming[];
    } catch (error) {
        console.error('API Error:', error);
        return [];
    }
};

export interface JikanStaff {
    person: {
        mal_id: number;
        url: string;
        images: {
            jpg: {
                image_url: string;
            };
        };
        name: string;
    };
    positions: string[];
}


export const getAnimeStaff = async (id: number) => {
    try {
        const response = await fetch(`${BASE_URL}/anime/${id}/staff`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.data as JikanStaff[];
    } catch (error) {
        console.error('API Error:', error);
        return [];
    }
};

export const getAnimeSchedule = async (filter?: string) => {
    try {
        const url = filter
            ? `${BASE_URL}/schedules?filter=${filter}&sfw=true`
            : `${BASE_URL}/schedules?sfw=true`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.data as JikanResult[];
    } catch (error) {
        console.error('API Error:', error);
        return [];
    }
};

export const getRandomAnime = async () => {
    try {
        const response = await fetch(`${BASE_URL}/random/anime?sfw=true`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.data as JikanResult;
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
};

export interface JikanReview {
    mal_id: number;
    url: string;
    type: string;
    reactions: {
        overall: number;
        nice: number;
        love_it: number;
        funny: number;
        confusing: number;
        informative: number;
        well_written: number;
        creative: number;
    };
    date: string;
    review: string;
    score: number;
    tags: string[];
    is_spoiler: boolean;
    is_preliminary: boolean;
    user: {
        username: string;
        url: string;
        images: {
            jpg: {
                image_url: string;
            }
        }
    };
}

export const getWorkReviews = async (id: number, type: 'anime' | 'manga') => {
    try {
        // Fetch top rated reviews first (default Jikan behavior usually sorts by helpfullness/date depending on params, but let's stick to default for now)
        const response = await fetch(`${BASE_URL}/${type}/${id}/reviews?spoilers=false&preliminary=false`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.data as JikanReview[];
    } catch (error) {
        console.error('API Error:', error);
        return [];
    }
};

// ==================== CHARACTER & PERSON ENDPOINTS ====================

export interface JikanCharacterFull {
    mal_id: number;
    url: string;
    images: {
        jpg: { image_url: string };
        webp: { image_url: string; small_image_url: string };
    };
    name: string;
    name_kanji: string | null;
    nicknames: string[];
    favorites: number;
    about: string | null;
}

export interface JikanCharacterAnime {
    role: string;
    anime: {
        mal_id: number;
        url: string;
        images: { jpg: { image_url: string; large_image_url: string } };
        title: string;
    };
}

export interface JikanCharacterVoice {
    language: string;
    person: {
        mal_id: number;
        url: string;
        images: { jpg: { image_url: string } };
        name: string;
    };
}

export const getCharacterById = async (id: number) => {
    try {
        const response = await fetch(`${BASE_URL}/characters/${id}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.data as JikanCharacterFull;
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
};

export const getCharacterFull = async (id: number) => {
    try {
        const response = await fetch(`${BASE_URL}/characters/${id}/full`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.data as JikanCharacterFull & {
            anime: JikanCharacterAnime[];
            manga: JikanCharacterAnime[];
            voices: JikanCharacterVoice[];
        };
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
};

export interface JikanPersonFull {
    mal_id: number;
    url: string;
    website_url: string | null;
    images: { jpg: { image_url: string } };
    name: string;
    given_name: string | null;
    family_name: string | null;
    alternate_names: string[];
    birthday: string | null;
    favorites: number;
    about: string | null;
}

export interface JikanPersonVoice {
    role: string;
    anime: {
        mal_id: number;
        url: string;
        images: { jpg: { image_url: string; large_image_url: string } };
        title: string;
    };
    character: {
        mal_id: number;
        url: string;
        images: { jpg: { image_url: string } };
        name: string;
    };
}

export const getPersonById = async (id: number) => {
    try {
        const response = await fetch(`${BASE_URL}/people/${id}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.data as JikanPersonFull;
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
};

export const getPersonFull = async (id: number) => {
    try {
        const response = await fetch(`${BASE_URL}/people/${id}/full`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.data as JikanPersonFull & {
            voices: JikanPersonVoice[];
            anime: { position: string; anime: { mal_id: number; title: string; images: { jpg: { image_url: string } } } }[];
        };
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
};

export const searchCharacters = async (query: string, limit: number = 15) => {
    try {
        const response = await fetch(`${BASE_URL}/characters?q=${encodeURIComponent(query)}&limit=${limit}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.data as JikanCharacterFull[];
    } catch (error) {
        console.error('API Error:', error);
        return [];
    }
};

export const searchPeople = async (query: string, limit: number = 15) => {
    try {
        const response = await fetch(`${BASE_URL}/people?q=${encodeURIComponent(query)}&limit=${limit}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.data as JikanPersonFull[];
    } catch (error) {
        console.error('API Error:', error);
        return [];
    }
};
