import { config } from './config';

export function getHost() {
  const hostname = config.serverHostname || window.location.hostname;
  const port =
    process.env.NODE_ENV !== 'production'
      ? config.developmentPort
      : config.productionPort;

  if (!port) {
    return hostname;
  }

  return `${hostname}:${port}`;
}

export function getSignalingUrl(peerId, roomId) {
  const url = `wss://${getHost()}/?peerId=${peerId}&roomId=${roomId}`;

  return url;
}
