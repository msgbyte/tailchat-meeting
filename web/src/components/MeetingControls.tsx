import { Button } from '@arco-design/web-react';
import { IconSettings } from '@arco-design/web-react/icon';
import React from 'react';
import { useMeetingClient } from '../client';
import { useMeetingState } from '../store/meeting';
import { useMeetingSettings } from '../store/settings';
import { Icon } from './Icon';
import { openSettingsModal } from './modal/Settings';

export const MeetingControls: React.FC = React.memo((props) => {
  const { webcamProducer, micProducer, screenSharingProducer } =
    useMeetingState((state) => state.producer);
  const client = useMeetingClient();

  return (
    <div className="space-x-2">
      <Button
        type={micProducer ? 'primary' : 'secondary'}
        icon={
          <Icon icon={micProducer ? 'mdi:microphone' : 'mdi:microphone-off'} />
        }
        title={micProducer ? '关闭麦克风' : '开启麦克风'}
        onClick={() => {
          micProducer ? client.disableMic() : client.enableMic();
        }}
      />
      <Button
        type={webcamProducer ? 'primary' : 'secondary'}
        icon={<Icon icon={webcamProducer ? 'mdi:video' : 'mdi:video-off'} />}
        title={webcamProducer ? '关闭摄像头' : '开启摄像头'}
        onClick={() => {
          webcamProducer ? client.disableWebcam() : client.enableWebcam();
        }}
      />

      <Button
        type="secondary"
        icon={<IconSettings />}
        title="设置"
        onClick={openSettingsModal}
      />
    </div>
  );
});
MeetingControls.displayName = 'MeetingControls';
