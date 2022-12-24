import React from 'react';
import { CameraPreview } from '../components/CameraPreview';
import { Controls } from '../components/Controls';
import Split from 'react-split';

export const MainPage: React.FC = React.memo(() => {
  return (
    <div className="bg-gray-700 w-screen h-screen flex flex-col">
      <div className="flex-1 overflow-hidden">
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
      </div>
      <div className="p-2 bg-gray-800 text-center">
        <Controls size="large" />
      </div>
    </div>
  );
});
MainPage.displayName = 'MainPage';
