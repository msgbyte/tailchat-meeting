import React from 'react';
import type { CollaborationInfo } from '../../store/slices/room';

interface CollaborationTitleProps {
  info: CollaborationInfo;
}
export const CollaborationTitle: React.FC<CollaborationTitleProps> = React.memo(
  (props) => {
    const { info } = props;

    if (info.type === 'excalidraw') {
      return <div>Excalidraw</div>;
    }

    return <div />;
  }
);
CollaborationTitle.displayName = 'CollaborationTitle';
