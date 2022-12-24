import React, { useState } from 'react';
import { Input, Button, Message } from '@arco-design/web-react';
import { IconUser } from '@arco-design/web-react/icon';
import { useMemoizedFn, useSetState } from 'ahooks';
import logoSvg from '../assets/logo.svg';
import { CameraPreview } from './CameraPreview';
import { useMeetingClient } from '../client';
import { JoinControls } from './JoinControls';
import { useMeetingSettings } from '../store/settings';
import { useNavigate } from 'react-router';

export const JoinView: React.FC = React.memo(() => {
  const mediaPerms = useMeetingSettings((state) => state.mediaPerms);
  const displayName = useMeetingSettings((state) => state.displayName);
  const [roomId, setRoomId] = useState('');
  const client = useMeetingClient();
  const navigate = useNavigate();

  const handleJoin = useMemoizedFn(async () => {
    if (!roomId) {
      Message.error('请填写房间号');
      return;
    }
    if (!displayName) {
      Message.error('请填写名称');
      return;
    }

    await client.join(roomId, {
      ...mediaPerms,
      displayName,
      picture: '',
    });
    Message.success('加入成功');
    navigate(`/meeting/${roomId}`);
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
          value={roomId}
          onChange={(roomId) => setRoomId(roomId)}
        />

        <Input
          size="large"
          placeholder="你的名字"
          value={displayName}
          onChange={(displayName) =>
            useMeetingSettings.setState({ displayName })
          }
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
          <JoinControls />
        </div>

        <Button type="primary" size="large" long={true} onClick={handleJoin}>
          加入房间
        </Button>
      </div>
    </div>
  );
});
JoinView.displayName = 'JoinView';
