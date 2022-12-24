import React from 'react';
import { VideoView } from '.';
import { useMeetingState } from '../../store/meeting';
import { useMeetingSettings } from '../../store/settings';

export const ProducerVideoView: React.FC = React.memo(() => {
  const producer = useMeetingState((state) => state.producer);
  const displayName = useMeetingSettings((state) => state.displayName);

  return (
    <VideoView
      displayName={`${displayName}(我)`}
      videoTrack={producer.webcamProducer?.track ?? null}
      audioTrack={producer.micProducer?.track ?? null}
    />
  );
});
ProducerVideoView.displayName = 'ProducerVideoView';
