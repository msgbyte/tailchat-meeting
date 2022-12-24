import React, { useEffect, useRef } from 'react';
import buddySvg from '../../assets/buddy.svg';

interface VideoViewProps {
  displayName: string;
  videoTrack: MediaStreamTrack | null;
  audioTrack: MediaStreamTrack | null;
}
export const VideoView: React.FC<VideoViewProps> = React.memo((props) => {
  const videoEl = useRef<HTMLVideoElement>(null);
  const videoAvailable = Boolean(videoEl.current?.srcObject);

  useEffect(() => {
    if (!videoEl.current) {
      return;
    }

    if (!props.videoTrack) {
      videoEl.current.srcObject = null;
    } else {
      videoEl.current.srcObject = new MediaStream([props.videoTrack]);
    }
  }, [props.videoTrack]);

  return (
    <div className="relative w-full aspect-video bg-gray-800 rounded-lg flex justify-center items-center">
      <video
        ref={videoEl}
        className="z-10"
        autoPlay
        playsInline
        muted
        controls={false}
      />

      <div className="absolute left-0 bottom-0 text-xs text-gray-300 text-opacity-80 bg-black bg-opacity-50 px-3 py-1 rounded-tr">
        {props.displayName}
      </div>

      {!videoAvailable && (
        <div className="absolute inset-0 flex justify-center items-center">
          <div
            className="bg-no-repeat bg-bottom h-1/2 aspect-square rounded-full bg-contain"
            style={{
              backgroundImage: `url(${buddySvg})`,
            }}
          />
        </div>
      )}
    </div>
  );
});
VideoView.displayName = 'VideoView';
