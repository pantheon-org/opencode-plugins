import type { CleanupState, ReloadResult } from '../types';
import { isServerListening } from './is-server-listening';
import { tryDispose } from './try-dispose';

export async function handleReload(
  disposeUrl: string,
  disposeEnabled: boolean,
  state: CleanupState,
): Promise<ReloadResult> {
  if (!disposeEnabled || !disposeUrl) {
    return { shouldRestart: true, message: 'Dispose not enabled' };
  }

  const listening = await isServerListening(disposeUrl);
  if (!listening) {
    return { shouldRestart: true, message: 'Server not reachable' };
  }

  const disposed = await tryDispose(disposeUrl);
  if (disposed) {
    return { shouldRestart: false, message: 'Server reload requested' };
  }

  return { shouldRestart: true, message: 'Dispose request failed' };
}
