// Timeout handling utility for API calls
export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number = 30000,
  timeoutMessage: string = 'Request timeout'
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    )
  ]);
};

// Retry utility for failed requests
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000
): Promise<T> => {
  let lastError: Error | undefined;
  let currentDelay = initialDelayMs;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on certain errors
      if (error instanceof Error && (
        error.message.includes('401') ||
        error.message.includes('403') ||
        error.message.includes('404')
      )) {
        throw error;
      }
      
      if (i < maxRetries - 1) {
        console.log(`Retry ${i + 1}/${maxRetries} after ${currentDelay}ms delay`);
        await new Promise(resolve => setTimeout(() => resolve(undefined), currentDelay));
        currentDelay *= 2; // Exponential backoff
      }
    }
  }
  
  throw new Error(lastError?.message || 'Max retries exceeded');
};

// Combined timeout and retry utility
export const withTimeoutAndRetry = <T>(
  fn: () => Promise<T>,
  timeoutMs: number = 30000,
  maxRetries: number = 2
): Promise<T> => {
  return withRetry(
    () => withTimeout(fn(), timeoutMs),
    maxRetries
  );
};
