import { isServerListening } from './is-server-listening';

export async function detectServerAvailability(disposeUrl: string, disposeEnabled: boolean): Promise<boolean> {
  if (!disposeEnabled || !disposeUrl) return false;
  try {
    return await isServerListening(disposeUrl);
  } catch {
    return false;
  }
}
