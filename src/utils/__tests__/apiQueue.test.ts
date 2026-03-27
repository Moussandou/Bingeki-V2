import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiQueue, jikanQueue } from '../apiQueue';


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
    });

    describe('ApiQueue implementation', () => {
        let testQueue: ApiQueue;

        beforeEach(() => {
            testQueue = new ApiQueue();
            vi.useFakeTimers();
        });

        afterEach(() => {
            testQueue.clear();
            vi.useRealTimers();
            vi.restoreAllMocks();
        });

        it('should sequence requests based on minInterval', async () => {
            const mockFetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ data: 'ok' }),
            });
            vi.stubGlobal('fetch', mockFetch);

            const p1 = testQueue.fetch('url1');
            const p2 = testQueue.fetch('url2');
            
            // Advance timers for first request immediately
            await vi.advanceTimersByTimeAsync(0);
            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(mockFetch).toHaveBeenCalledWith('url1', expect.anything());

            // Advance by minInterval - it should trigger next request
            // ApiQueue minInterval is 800
            await vi.advanceTimersByTimeAsync(801);
            
            expect(mockFetch).toHaveBeenCalledTimes(2);
            expect(mockFetch).toHaveBeenCalledWith('url2', expect.anything());
            
            await Promise.all([p1, p2]);
        });

        it('should timeout individual requests and retry', async () => {
            // Mock fetch to hang but respect signal
            const mockFetch = vi.fn().mockImplementation((_url, options) => {
                return new Promise((_resolve, reject) => {
                    if (options?.signal) {
                        options.signal.addEventListener('abort', () => {
                            reject(new DOMException('Aborted', 'AbortError'));
                        });
                    }
                });
            });
            vi.stubGlobal('fetch', mockFetch);


            const promise = testQueue.fetch('url-timeout');
            
            // Starts request 1
            await vi.advanceTimersByTimeAsync(0);
            expect(mockFetch).toHaveBeenCalledTimes(1);

            // Wait 10s for timeout in processQueue
            await vi.advanceTimersByTimeAsync(10001);
            
            // Allow microtasks to run (fetch rejecting)
            await vi.advanceTimersByTimeAsync(0);

            // After timeout it waits 500ms delay then retries (unshift)
            await vi.advanceTimersByTimeAsync(501);
            expect(mockFetch).toHaveBeenCalledTimes(2);

            // Retry 2
            await vi.advanceTimersByTimeAsync(10001 + 501);
            await vi.advanceTimersByTimeAsync(0);
            expect(mockFetch).toHaveBeenCalledTimes(3);

            // Retry 3 (final attempt based on maxRetries=3)
            await vi.advanceTimersByTimeAsync(10001 + 501);
            await vi.advanceTimersByTimeAsync(0);
            expect(mockFetch).toHaveBeenCalledTimes(4);

            await vi.advanceTimersByTimeAsync(10001);
            await vi.advanceTimersByTimeAsync(0);
            
            await expect(promise).rejects.toThrow('Request timed out');

        }, 30000);

        it('should retry on 429 status with Retry-After header', async () => {
            const mockFetch = vi.fn()
                .mockResolvedValueOnce({
                    status: 429,
                    ok: false,
                    headers: new Headers([['Retry-After', '1']])
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve({ data: 'success' })
                });
            vi.stubGlobal('fetch', mockFetch);

            const promise = testQueue.fetch('url-429');
            
            // Starts initial request
            await vi.advanceTimersByTimeAsync(0);
            expect(mockFetch).toHaveBeenCalledTimes(1);

            // 429 logic: unshift + delay(retryAfter)
            // advance for the 1s delay
            await vi.advanceTimersByTimeAsync(1001);
            
            const result = await promise;
            expect(mockFetch).toHaveBeenCalledTimes(2);
            await expect(result.json()).resolves.toEqual({ data: 'success' });
        });
    });
});
