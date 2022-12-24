import { Form, Select } from '@arco-design/web-react';
import React from 'react';
import { CameraPreview } from '../../CameraPreview';

export const VideoView: React.FC = React.memo(() => {
  return (
    <div>
      <div className="m-auto">
        <CameraPreview />
      </div>
      <Form className="pt-4">
        <Form.Item label="视频设备">
          <Select value={'default'}>
            <Select.Option value="default">系统默认</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </div>
  );
});
VideoView.displayName = 'VideoView';
