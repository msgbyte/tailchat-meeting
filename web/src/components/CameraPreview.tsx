import { useMemoizedFn, useMount } from 'ahooks';
import React, { useRef } from 'react';

/**
 * 视频预览
 */
export const CameraPreview: React.FC = React.memo(() => {
  const el = useRef<HTMLVideoElement>(null);

  const applyVideoStream = useMemoizedFn(async () => {
    if (!el.current) {
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });

    el.current.srcObject = stream;
  });

  useMount(() => {
    applyVideoStream();
  });

  return (
    <div>
      <video ref={el} autoPlay={true} />
    </div>
  );
});
CameraPreview.displayName = 'CameraPreview';
