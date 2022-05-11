import { useAppSelector } from '../selectors';
import { last } from 'lodash-es';

/**
 * 获取当前选中的参会者id
 */
export function useSelectedPeerId(): string | undefined {
  const peers = useAppSelector((state) => state.peers);
  const selectedPeers = useAppSelector((state) => state.room.selectedPeers);

  let selectedPeerId: string;

  if (selectedPeers && selectedPeers.length > 0 && peers[last(selectedPeers)]) {
    selectedPeerId = last(selectedPeers);
  }

  return selectedPeerId;
}
