import net from 'node:net';

export async function isServerListening(disposeUrl: string, timeoutMs = 500): Promise<boolean> {
  try {
    const u = new URL(disposeUrl);
    const port = u.port ? Number(u.port) : u.protocol === 'https:' ? 443 : 80;
    const host = u.hostname;
    return await new Promise((resolve) => {
      const socket = net.connect({ host, port }, () => {
        socket.destroy();
        resolve(true);
      });
      socket.on('error', () => {
        try {
          socket.destroy();
        } catch {}
        resolve(false);
      });
      socket.setTimeout(timeoutMs, () => {
        try {
          socket.destroy();
        } catch {}
        resolve(false);
      });
    });
  } catch {
    return false;
  }
}
