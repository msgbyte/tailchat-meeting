import { Menu, Modal } from '@arco-design/web-react';
import React, { useState } from 'react';
import { AudioView } from './AudioView';
import { CommonView } from './CommonView';
import { VideoView } from './VideoView';
import { IconSettings } from '@arco-design/web-react/icon';
import { Icon } from '../../Icon';
import './index.less';

const MenuItem = Menu.Item;

const settingViewMap: Record<string, React.ReactNode> = {
  common: <CommonView />,
  video: <VideoView />,
  audio: <AudioView />,
};

export const SettingsModal: React.FC = React.memo(() => {
  const [key, setKey] = useState('common');

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 text-lg">设置</div>
      <div className="flex flex-1 overflow-hidden">
        <div className="border-r w-48">
          <Menu selectedKeys={[key]} onClickMenuItem={(key) => setKey(key)}>
            <MenuItem key="common">
              <IconSettings />
              通用
            </MenuItem>
            <MenuItem key="video">
              <Icon icon="mdi:video" />
              视频
            </MenuItem>
            <MenuItem key="audio">
              <Icon icon="mdi:microphone" />
              音频
            </MenuItem>
          </Menu>
        </div>
        <div className="flex-1 px-2 overflow-auto">
          {settingViewMap[key] ?? null}
        </div>
      </div>
    </div>
  );
});
SettingsModal.displayName = 'SettingsModal';

export function openSettingsModal() {
  Modal.confirm({
    title: null,
    content: <SettingsModal />,
    icon: null,
    footer: null,
    className: 'settings-modal',
    unmountOnExit: true,
  });
}
