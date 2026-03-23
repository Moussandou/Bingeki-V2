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

        it('should sequence requests based on minInterval', async () => {
            vi.useFakeTimers();
            const mockFetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ data: 'ok' }),
            });
            vi.stubGlobal('fetch', mockFetch);

            const p1 = queuedFetch('url1');
            const p2 = queuedFetch('url2');
            
            // Advance timers for the first request
            await vi.advanceTimersByTimeAsync(0); 
            // Advance timers for the second request's minInterval wait
            await vi.advanceTimersByTimeAsync(400); 
            
            await Promise.all([p1, p2]);
            expect(mockFetch).toHaveBeenCalledTimes(2);
            vi.useRealTimers();
        });

        it('should timeout after 10 seconds', async () => {
            vi.useFakeTimers();
            const mockFetch = vi.fn().mockImplementation(() => new Promise(() => {}));
            vi.stubGlobal('fetch', mockFetch);

            const promise = queuedFetch('url-timeout');
            
            // Allow the loop to reach the fetch call
            await vi.advanceTimersByTimeAsync(0);
            
            // Advance time past the 10s default timeout
            await vi.advanceTimersByTimeAsync(11000);
            
            // The request should be rejected after 3 retries (each taking 10s + 500ms delay)
            await vi.advanceTimersByTimeAsync(40000);
            
            await expect(promise).rejects.toThrow('Request timed out');
            vi.useRealTimers();
        }, 20000);

        it('should retry on 429 status', async () => {
            vi.useFakeTimers();
            const mockFetch = vi.fn()
                .mockResolvedValueOnce({
                    status: 429,
                    ok: false,
                    headers: new Map([['Retry-After', '1']])
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve({ data: 'success' })
                });
            vi.stubGlobal('fetch', mockFetch);

            const promise = queuedFetch('url-429');
            
            // Allow loop to start
            await vi.advanceTimersByTimeAsync(0);
            // Advance for 429 retry delay (1s from header)
            await vi.advanceTimersByTimeAsync(2000); 
            
            const result = await promise;
            const data = await result.json();
            expect(data.data).toBe('success');
            expect(mockFetch).toHaveBeenCalledTimes(2);
            vi.useRealTimers();
        }, 20000);
    });
});
