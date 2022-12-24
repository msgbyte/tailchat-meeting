import React from 'react';
import { Input, Button, Message } from '@arco-design/web-react';
import { IconUser } from '@arco-design/web-react/icon';
import { useMemoizedFn, useSetState } from 'ahooks';
import logoSvg from '../assets/logo.svg';
import { CameraPreview } from './CameraPreview';
import { useMeetingClient } from '../client';
import { Controls } from './Controls';
import { useMeetingSettings } from '../store/settings';

export const JoinView: React.FC = React.memo(() => {
  const { mediaPerms } = useMeetingSettings();
  const [joinInfo, setJoinInfo] = useSetState({
    roomId: '',
    displayName: '',
  });
  const client = useMeetingClient();

  const handleJoin = useMemoizedFn(async () => {
    if (!joinInfo.roomId) {
      Message.error('请填写房间号');
      return;
    }
    if (!joinInfo.displayName) {
      Message.error('请填写名称');
      return;
    }

    await client.join(joinInfo.roomId, {
      ...mediaPerms,
      displayName: joinInfo.displayName,
      picture: '',
    });
    Message.success('加入成功');
    // TODO: 页面跳转
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

        <Input
          size="large"
          placeholder="房间号"
          value={joinInfo.roomId}
          onChange={(roomId) => setJoinInfo({ roomId })}
        />

        <Input
          size="large"
          placeholder="你的名字"
          value={joinInfo.displayName}
          onChange={(displayName) => setJoinInfo({ displayName })}
        />

        <div className="w-full bg-gray-300 aspect-video">
          {mediaPerms.video ? (
            <CameraPreview />
          ) : (
            <div className="w-full h-full flex justify-center items-center">
              <IconUser fontSize={44} style={{ color: '#666' }} />
            </div>
          )}
        </div>

        <div>
          <Controls />
        </div>

        <Button type="primary" size="large" long={true} onClick={handleJoin}>
          加入房间
        </Button>
      </div>
    </div>
  );
});
JoinView.displayName = 'JoinView';
