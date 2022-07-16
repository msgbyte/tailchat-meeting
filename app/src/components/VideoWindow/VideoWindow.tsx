import React from 'react';
import NewWindow from './NewWindow';
import FullView from '../VideoContainers/FullView';
import { useAppDispatch, useAppSelector } from '../../store/selectors';
import { roomActions } from '../../store/slices/room';

export const VideoWindow: React.FC = React.memo(() => {
  const { consumer, aspectRatio } = useAppSelector((state) => ({
    consumer: state.consumers[state.room.windowConsumer],
    aspectRatio: state.settings.aspectRatio,
  }));
  const dispatch = useAppDispatch();

  const toggleConsumerWindow = () => {
    dispatch(roomActions.toggleConsumerWindow());
  };

  if (!consumer) return null;

  const consumerVisible =
    Boolean(consumer) && !consumer.locallyPaused && !consumer.remotelyPaused;

  return (
    <NewWindow onUnload={toggleConsumerWindow} aspectRatio={aspectRatio}>
      <FullView
        videoTrack={consumer && consumer.track}
        videoVisible={consumerVisible}
      />
    </NewWindow>
  );
});
VideoWindow.displayName = 'VideoWindow';
