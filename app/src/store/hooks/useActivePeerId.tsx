import { useAppSelector } from '../selectors';
import { useSelectedPeerId } from './useSelectedPeerId';

/**
 * 获取当前peer的id
 */
export function useActivePeerId(lastSpeakerId?: string): string | undefined {
  const peers = useAppSelector((state) => state.peers);

  const selectedPeerId = useSelectedPeerId();

  if (selectedPeerId && peers[selectedPeerId]) {
    return selectedPeerId;
  }

  if (lastSpeakerId && peers[lastSpeakerId]) {
    return lastSpeakerId;
  }

  const peerIds = Object.keys(peers);
  if (peerIds.length > 0) {
    return peerIds[0];
  }
}
