import { Form, Select } from '@arco-design/web-react';
import React from 'react';

export const CommonView: React.FC = React.memo(() => {
  return (
    <div>
      <Form>
        <Form.Item label="布局方式">
          <Select value={'grid'}>
            <Select.Option value="grid">宫格布局</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </div>
  );
});
CommonView.displayName = 'CommonView';
