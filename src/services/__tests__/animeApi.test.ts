import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as animeApi from '../animeApi';
import * as firebaseFunctions from '@/firebase/functions';

// Mock localStorage with proper typing for TS
interface MockStorage extends Storage {
    [key: string]: any;
}

const localStorageMock: MockStorage = {} as any;

Object.defineProperties(localStorageMock, {
    getItem: { 
        value: vi.fn(function(this: MockStorage, key: string) { return this[key] || null; }), 
        enumerable: false 
    },
    setItem: { 
        value: vi.fn(function(this: MockStorage, key: string, value: string) { 
            this[key] = value.toString(); 
        }), 
        enumerable: false 
    },
    removeItem: { 
        value: vi.fn(function(this: MockStorage, key: string) { 
            delete this[key]; 
        }), 
        enumerable: false 
    },
    clear: { 
        value: vi.fn(function(this: MockStorage) { 
            Object.keys(this).forEach(key => delete this[key]);
        }), 
        enumerable: false 
    },
    key: { 
        value: vi.fn(function(this: MockStorage, index: number) {
            return Object.keys(this)[index] || null;
        }), 
        enumerable: false 
    },
    length: { 
        get: function(this: MockStorage) {
            return Object.keys(this).length;
        }, 
        enumerable: false 
    }
});

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

vi.mock('@/firebase/functions', () => ({
    getWorkReviewsFn: vi.fn()
}));

describe('Anime API Service - callProxy & Caching', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorageMock.clear();
    });

    it('should call the Cloud Function on first call (Cache MISS)', async () => {
        const mockData = [{ mal_id: 1, review: 'Test' }];
        (firebaseFunctions.getWorkReviewsFn as any).mockResolvedValue({ data: mockData });

        const result = await animeApi.getWorkReviews(123, 'anime');

        expect(result).toEqual(mockData);
        expect(firebaseFunctions.getWorkReviewsFn).toHaveBeenCalledTimes(1);
    });

    it('should use memory cache on subsequent calls (Cache HIT)', async () => {
        const mockData = [{ mal_id: 1, review: 'Test' }];
        (firebaseFunctions.getWorkReviewsFn as any).mockResolvedValue({ data: mockData });

        await animeApi.getWorkReviews(456, 'anime'); // First call
        const result = await animeApi.getWorkReviews(456, 'anime'); // Second call

        expect(result).toEqual(mockData);
        expect(firebaseFunctions.getWorkReviewsFn).toHaveBeenCalledTimes(1); // Only once
    });

    it('should deduplicate concurrent in-flight requests', async () => {
        const mockData = [{ mal_id: 1, review: 'Test' }];
        let callCount = 0;
        (firebaseFunctions.getWorkReviewsFn as any).mockImplementation(() => {
            callCount++;
            return new Promise(resolve => setTimeout(() => resolve({ data: mockData }), 50));
        });

        // Trigger two calls simultaneously
        const [res1, res2] = await Promise.all([
            animeApi.getWorkReviews(789, 'anime'),
            animeApi.getWorkReviews(789, 'anime')
        ]);

        expect(res1).toEqual(mockData);
        expect(res2).toEqual(mockData);
        expect(callCount).toBe(1); // Cloud Function called only once
    });

    it('should fallback to localStorage on page reload (Hydration)', async () => {
        const mockData = [{ id: 1, text: 'Cached' }];
        const cacheKey = 'anime_111_reviews';
        const lsKey = 'bgk_c_' + cacheKey;
        
        localStorageMock.setItem(lsKey, JSON.stringify({
            data: mockData,
            timestamp: Date.now()
        }));

        const result = await animeApi.getWorkReviews(111, 'anime');

        expect(result).toEqual(mockData);
        expect(firebaseFunctions.getWorkReviewsFn).not.toHaveBeenCalled();
    });

    it('should handle localStorage quota exceeded by cleaning up oldest entries', async () => {
        const mockData = { some: 'data' };
        
        // Setup initial storage
        localStorageMock.setItem('bgk_c_old', JSON.stringify({ data: 'old', timestamp: 100 }));
        localStorageMock.setItem('bgk_c_new', JSON.stringify({ data: 'new', timestamp: Date.now() }));

        // Mock setItem to fail on first attempt, then succeed
        let attempts = 0;
        (localStorageMock.setItem as any).mockImplementation(function(this: MockStorage, key: string, value: string) {
            attempts++;
            if (attempts === 1) {
                throw new Error('QuotaExceededError');
            }
            this[key] = value;
        });

        // Trigger a cache set that triggers the quota logic
        (firebaseFunctions.getWorkReviewsFn as any).mockResolvedValue({ data: mockData });
        
        // We'll call it with a fresh ID
        await animeApi.getWorkReviews(999, 'anime'); 

        // Verify that bgk_c_old was removed (the oldest one)
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('bgk_c_old');
        expect(localStorageMock['bgk_c_old']).toBeUndefined();
    });
});
