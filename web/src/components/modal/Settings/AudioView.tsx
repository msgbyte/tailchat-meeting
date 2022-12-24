import { Form, Select } from '@arco-design/web-react';
import React from 'react';

export const AudioView: React.FC = React.memo(() => {
  return (
    <div>
      <Form>
        <Form.Item label="音频设备">
          <Select value={'default'}>
            <Select.Option value="default">系统默认</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </div>
  );
});
AudioView.displayName = 'AudioView';
