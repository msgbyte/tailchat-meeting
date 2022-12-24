import React, { useMemo } from 'react';
import { CameraPreview } from '../components/CameraPreview';
import { MeetingControls } from '../components/MeetingControls';
import Split from 'react-split';
import { useMeetingState } from '../store/meeting';
import { ProducerVideoView } from '../components/VideoView/Producer';

export const MeetingPage: React.FC = React.memo(() => {
  const { peers, producer } = useMeetingState();

  return (
    <div className="bg-gray-700 w-screen h-screen flex flex-col">
      <div className="flex-1 overflow-hidden">
        {peers.size === 0 ? (
          <div className="h-full flex items-center justify-center p-8">
            {/* 单人，显示自己 */}
            <ProducerVideoView />
          </div>
        ) : (
          <Split
            className="split h-full"
            sizes={[75, 25]}
            minSize={240}
            maxSize={[Infinity, 480]}
            direction="horizontal"
          >
            <div className="h-full flex items-center justify-center">
              <CameraPreview />
            </div>
            <div className="space-y-2 flex flex-col items-center">
              <CameraPreview />
              <CameraPreview />
              <CameraPreview />
            </div>
          </Split>
        )}
      </div>
      <div className="p-2 bg-gray-800 text-center">
        <MeetingControls size="large" />
      </div>
    </div>
  );
});
MeetingPage.displayName = 'MeetingPage';
