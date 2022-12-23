import React from 'react';
import { Input, Button } from '@arco-design/web-react';
import { IconUser, IconSettings } from '@arco-design/web-react/icon';
import { useSetState } from 'ahooks';
import { Icon } from './Icon';
import logoSvg from '../assets/logo.svg';

export const JoinView: React.FC = React.memo(() => {
  const [mediaPerms, setMediaPerms] = useSetState({
    audio: false,
    video: false,
  });

  return (
    <div
      className="w-screen h-screen flex justify-center items-center bg-cover bg-gray-600 bg-no-repeat bg-center bg-fixed"
      style={{ backgroundImage: 'url(/images/background.jpg)' }}
    >
      <div className="w-96 h-auto rounded shadow p-4 bg-white space-y-2">
        <div className="flex items-center justify-between">
          <img src={logoSvg} />

          <div className="ml-1 text-xl font-bold text-gray-700">
            Tailchat Meeting
          </div>
        </div>

        <Input size="large" placeholder="房间号" />

        <Input size="large" placeholder="你的名字" />

        <div className="w-full bg-gray-300 aspect-video">
          <div className="w-full h-full flex justify-center items-center">
            <IconUser fontSize={44} style={{ color: '#666' }} />
          </div>
        </div>

        <div className="space-x-1">
          <Button
            type={mediaPerms.audio ? 'primary' : 'secondary'}
            icon={
              <Icon
                icon={
                  mediaPerms.audio ? 'mdi:microphone' : 'mdi:microphone-off'
                }
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
            icon={
              <Icon icon={mediaPerms.video ? 'mdi:video' : 'mdi:video-off'} />
            }
            title={mediaPerms.video ? '关闭摄像头' : '开启摄像头'}
            onClick={() =>
              setMediaPerms({
                video: !mediaPerms.video,
              })
            }
          />

          <Button type="secondary" icon={<IconSettings />} title="设置" />
        </div>

        <Button type="primary" size="large" long={true}>
          加入房间
        </Button>
      </div>
    </div>
  );
});
JoinView.displayName = 'JoinView';
