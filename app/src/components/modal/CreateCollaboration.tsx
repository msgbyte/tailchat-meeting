import { Button, Modal } from '@arco-design/web-react';
import { useAppDispatch, useAppSelector } from '../../store/selectors';
import React from 'react';
import { ReduxProvider } from '../../store/Provider';
import { useMemoizedFn } from 'ahooks';
import { CollaborationInfo, roomActions } from '../../store/slices/room';
import { generateRandomString } from '../../utils';

const CreateCollaborationModal: React.FC<{ onClose: () => void }> = React.memo(
  (props) => {
    const roomClient = useAppSelector((state) => state.room.client);
    const dispatch = useAppDispatch();

    const handleCreate = useMemoizedFn((type: CollaborationInfo['type']) => {
      if (type === 'excalidraw') {
        // TODO: 发送请求
        const key = generateRandomString(22);
        const docId = generateRandomString(8);
        const roomId = roomClient.roomId;
        const url = `https://excalidraw.com/#room=tailchat${roomId}000${docId},${key}`;

        dispatch(
          roomActions.createExcalidraw({
            url,
          })
        );
        props.onClose();
      }
    });

    return (
      <div>
        <Button
          size="large"
          long={true}
          onClick={() => handleCreate('excalidraw')}
        >
          Excalidraw
        </Button>
      </div>
    );
  }
);
CreateCollaborationModal.displayName = 'CreateCollaborationModal';

export function openCreateCollaborationModal() {
  const info = Modal.confirm({
    title: 'Start Collaboration',
    content: (
      <ReduxProvider>
        <CreateCollaborationModal onClose={() => info.close()} />
      </ReduxProvider>
    ),
    footer: null,
    icon: null,
  });
}
