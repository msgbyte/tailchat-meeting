export const setPeerVolume = (peerId, volume) => ({
  type: 'SET_PEER_VOLUME',
  payload: { peerId, volume },
});
export const initPeerVolume = (peerId) => ({
  type: 'SET_ME',
  payload: { peerId },
});
