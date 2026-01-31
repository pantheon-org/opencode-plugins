import { isServerListening } from './is-server-listening';

export const detectServerAvailability = async (disposeUrl: string, disposeEnabled: boolean): Promise<boolean> => {
  if (!disposeEnabled || !disposeUrl) return false;
  try {
    return await isServerListening(disposeUrl);
  } catch {
    return false;
  }
};
