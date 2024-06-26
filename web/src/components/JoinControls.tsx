import { Button } from '@arco-design/web-react';
import { IconSettings } from '@arco-design/web-react/icon';
import React from 'react';
import { useMeetingSettings } from '../store/settings';
import { Icon } from './Icon';
import { openSettingsModal } from './modal/Settings';

export const JoinControls: React.FC = React.memo((props) => {
  const { mediaPerms, setMediaPerms } = useMeetingSettings();

  return (
    <div className="space-x-2">
      <Button
        type={mediaPerms.audio ? 'primary' : 'secondary'}
        icon={
          <Icon
            icon={mediaPerms.audio ? 'mdi:microphone' : 'mdi:microphone-off'}
          />
        }
        title={mediaPerms.audio ? '关闭麦克风' : '开启麦克风'}
        onClick={() =>
          setMediaPerms({
            audio: !mediaPerms.audio,
          })
        }
      />
      <Button
        type={mediaPerms.video ? 'primary' : 'secondary'}
        icon={<Icon icon={mediaPerms.video ? 'mdi:video' : 'mdi:video-off'} />}
        title={mediaPerms.video ? '关闭摄像头' : '开启摄像头'}
        onClick={() =>
          setMediaPerms({
            video: !mediaPerms.video,
          })
        }
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
JoinControls.displayName = 'JoinControls';
