import type { FetchError } from '../types';

export const attemptDisposeRequest = async (url: string, timeoutMs: number): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'content-type': 'application/json' },
      body: '{}',
    });
    clearTimeout(id);
    if (res.ok) {
      console.log(`Dispose request succeeded (status ${res.status})`);
      return true;
    }
    console.warn(`Dispose request returned ${res.status}`);
    return false;
  } catch (err) {
    const fetchErr = err as FetchError;
    if (fetchErr.name === 'AbortError') {
      console.warn(`Dispose request timed out`);
    } else {
      console.warn(`Dispose request error: ${String(err)}`);
    }
    return false;
  }
};
