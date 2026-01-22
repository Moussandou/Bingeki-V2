/**
 * API Request Queue
 * 
 * Throttles requests to external APIs to avoid rate limiting.
 * Jikan API limit: 3 requests/second, 60 requests/minute
 */

interface QueuedRequest {
    url: string;
    options?: RequestInit;
    resolve: (value: Response) => void;
    reject: (reason: Error) => void;
    retries: number;
}

class ApiQueue {
    private queue: QueuedRequest[] = [];
    private processing = false;
    private lastRequestTime = 0;
    private readonly minInterval = 350; // ~3 requests/sec
    private readonly maxRetries = 2;
    private readonly retryDelay = 1500; // Wait 1.5s on 429

    /**
     * Add a request to the queue
     */
    async fetch(url: string, options?: RequestInit): Promise<Response> {
        return new Promise((resolve, reject) => {
            this.queue.push({ url, options, resolve, reject, retries: 0 });
            this.processQueue();
        });
    }

    /**
     * Process the queue with rate limiting
     */
    private async processQueue(): Promise<void> {
        if (this.processing || this.queue.length === 0) return;

        this.processing = true;

        while (this.queue.length > 0) {
            const request = this.queue.shift()!;

            // Ensure minimum interval between requests
            const now = Date.now();
            const timeSinceLastRequest = now - this.lastRequestTime;
            if (timeSinceLastRequest < this.minInterval) {
                await this.delay(this.minInterval - timeSinceLastRequest);
            }

            try {
                this.lastRequestTime = Date.now();
                const response = await fetch(request.url, request.options);

                // Handle rate limiting
                if (response.status === 429) {
                    if (request.retries < this.maxRetries) {
                        console.warn(`[ApiQueue] Rate limit hit, retrying in ${this.retryDelay}ms...`);
                        request.retries++;
                        this.queue.unshift(request); // Put back at front
                        await this.delay(this.retryDelay);
                        continue;
                    }
                    request.reject(new Error('Rate limit exceeded after retries'));
                    continue;
                }

                request.resolve(response);
            } catch (error) {
                if (request.retries < this.maxRetries) {
                    request.retries++;
                    this.queue.unshift(request);
                    await this.delay(500); // Brief delay before retry
                    continue;
                }
                request.reject(error instanceof Error ? error : new Error(String(error)));
            }
        }

        this.processing = false;
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Clear all pending requests
     */
    clear(): void {
        const pending = this.queue.splice(0);
        pending.forEach(req => req.reject(new Error('Queue cleared')));
    }

    /**
     * Get queue status for debugging
     */
    get status(): { pending: number; processing: boolean } {
        return {
            pending: this.queue.length,
            processing: this.processing
        };
    }
}

// Singleton instance for Jikan API
export const jikanQueue = new ApiQueue();

/**
 * Wrapper for fetch that uses the queue
 * Drop-in replacement for fetch() calls to Jikan API
 */
export const queuedFetch = (url: string, options?: RequestInit): Promise<Response> => {
    return jikanQueue.fetch(url, options);
};
