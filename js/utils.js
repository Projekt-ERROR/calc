/**
 * utility functions for the calculator application
 */

/**
 * sleep utility with abort support
 * @param {number} ms - Milliseconds to sleep
 * @param {AbortSignal} abortSignal - Optional abort signal for cancellation
 * @returns {Promise<void>}
 */
const sleep = (ms, abortSignal) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);

    abortSignal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Cancelled', 'AbortError'));
    });
  });
};
