/**
 * Pauses the execution for a specified duration.
 * @param {number} ms - The duration to pause in milliseconds.
 * @returns {Promise<void>} - A promise that resolves after the specified duration.
 */

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}