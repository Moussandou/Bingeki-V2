import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { queuedFetch, jikanQueue } from '../apiQueue';

describe('apiQueue', () => {
    describe('jikanQueue singleton', () => {
        it('should export jikanQueue object', () => {
            expect(jikanQueue).toBeDefined();
        });

        it('should have a fetch method', () => {
            expect(typeof jikanQueue.fetch).toBe('function');
        });

        it('should have a clear method', () => {
            expect(typeof jikanQueue.clear).toBe('function');
        });

        it('should have a status getter', () => {
            expect(jikanQueue.status).toBeDefined();
            expect(typeof jikanQueue.status.pending).toBe('number');
            expect(typeof jikanQueue.status.processing).toBe('boolean');
        });
    });

    describe('queuedFetch', () => {
        it('should be a function', () => {
            expect(typeof queuedFetch).toBe('function');
        });
    });

    describe('rate limiting behavior', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
            vi.restoreAllMocks();
            jikanQueue.clear();
        });

        it('should queue requests and return a promise', () => {
            const mockFetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ data: 'test' }),
            });
            vi.stubGlobal('fetch', mockFetch);

            const promise = queuedFetch('https://api.jikan.moe/v4/anime/1');
            expect(promise).toBeInstanceOf(Promise);
        });
    });
});
