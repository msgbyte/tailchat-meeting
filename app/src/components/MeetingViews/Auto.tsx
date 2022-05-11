import React from 'react';
import { someoneSharingSelector, useAppSelector } from '../../store/selectors';
import Democratic from './Democratic';
import Filmstrip from './Filmstrip';
import { SpeechView } from './SpeechView';

export const AutoMeetingView: React.FC = React.memo(() => {
  const advancedMode = useAppSelector((state) => state.settings.advancedMode);
  const isSharing = useAppSelector(someoneSharingSelector);

  // return <SpeechView />; // For test

  return isSharing ? (
    <Filmstrip advancedMode={advancedMode} />
  ) : (
    <Democratic advancedMode={advancedMode} />
  );
});
AutoMeetingView.displayName = 'AutoMeetingView';
