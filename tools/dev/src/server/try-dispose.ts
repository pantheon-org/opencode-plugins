import { attemptDisposeRequest } from './attempt-dispose-request';

export async function tryDispose(url: string, timeoutMs = 2000, retries = 2): Promise<boolean> {
  if (!url) return false;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const success = await attemptDisposeRequest(url, timeoutMs);
    if (success) return true;
    await new Promise((r) => setTimeout(r, 200 * (attempt + 1)));
  }
  return false;
}
