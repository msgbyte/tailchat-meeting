import { Empty } from '@arco-design/web-react';
import React from 'react';
import type { CollaborationInfo } from '../../store/slices/room';

interface CollaborationViewProps {
  info: CollaborationInfo;
}
export const CollaborationView: React.FC<CollaborationViewProps> = React.memo(
  (props) => {
    const { info } = props;

    if (info.type === 'excalidraw') {
      return <iframe className="w-full h-full" src={info.url} />;
    }

    return <Empty />;
  }
);
CollaborationView.displayName = 'CollaborationView';
