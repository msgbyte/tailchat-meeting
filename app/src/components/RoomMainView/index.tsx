import { Modal, ResizeBox, Tabs } from '@arco-design/web-react';
import { makeStyles } from '@material-ui/core';
import { useMemoizedFn, usePrevious } from 'ahooks';
import clsx from 'clsx';
import { last } from 'lodash-es';
import React, { useState } from 'react';
import { useWatch } from '../../hooks/useWatch';
import { useAppSelector } from '../../store/selectors';
import { AutoMeetingView } from '../MeetingViews/Auto';
import { Democratic } from '../MeetingViews/Democratic';
import Filmstrip from '../MeetingViews/Filmstrip';
import { openCreateCollaborationModal } from '../modal/CreateCollaboration';
import { CollaborationTitle } from './CollaborationTitle';
import { CollaborationView } from './CollaborationView';

const PADDING_V = 64;

const useStyles = makeStyles((theme) => ({
  hiddenToolBar: {
    paddingTop: 0,
    transition: 'padding .5s',
  },
  showingToolBar: {
    paddingTop: PADDING_V,
    transition: 'padding .5s',
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    '& .arco-tabs-content, & .arco-tabs-content-inner, & .arco-tabs-content-item':
      {
        height: '100%',
      },
    '& .arco-tabs-content': {
      padding: 0,
    },
  },
}));

export const RoomMainView: React.FC = React.memo(() => {
  const classes = useStyles();
  const roomLayout = useAppSelector((state) => state.room.layout);
  const showToolbar = useAppSelector(
    (state) => state.room.toolbarsVisible || state.settings.permanentTopBar
  );
  const collaboration = useAppSelector((state) => state.room.collaboration);

  const [moving, setMoving] = useState(false);
  const [activeTab, setActiveTab] = useState('');

  const len = collaboration.length;
  const prevcollaborationLen = usePrevious(len);
  useWatch([len], () => {
    if (prevcollaborationLen < collaboration.length) {
      // 新增
      setActiveTab(last(collaboration).tabId);
    } else {
      // 删除
      const index = collaboration.findIndex((x) => x.tabId === activeTab);
      if (index === -1 && collaboration[0]) {
        setActiveTab(collaboration[0].tabId);
      }
    }
  });

  const View = {
    auto: AutoMeetingView,
    filmstrip: Filmstrip,
    democratic: Democratic,
  }[roomLayout];

  const handleAddTab = useMemoizedFn(() => {
    openCreateCollaborationModal();
  });

  return (
    <div
      className={clsx(
        showToolbar ? classes.showingToolBar : classes.hiddenToolBar,
        'w-full h-full flex'
      )}
    >
      {Array.isArray(collaboration) && collaboration.length > 0 ? (
        // 共享模式
        <ResizeBox.Split
          className="w-full h-full"
          direction="horizontal"
          size={0.75}
          max={0.8}
          min={0.2}
          onMovingStart={() => setMoving(true)}
          onMovingEnd={() => setMoving(false)}
          panes={[
            <Tabs
              key="1"
              editable
              type="card-gutter"
              size="large"
              className={clsx('w-full h-full bg-white', classes.table, {
                'pointer-events-none': moving,
              })}
              activeTab={activeTab}
              onAddTab={handleAddTab}
              // onDeleteTab={handleDeleteTab}
              onChange={setActiveTab}
            >
              {collaboration.map((info, i) => (
                <Tabs.TabPane
                  key={info.tabId}
                  title={<CollaborationTitle info={info} />}
                  className="w-full h-full overflow-hidden"
                >
                  <CollaborationView info={info} />
                </Tabs.TabPane>
              ))}
            </Tabs>,
            <View key="2" />,
          ]}
        />
      ) : (
        // 纯视频模式
        <View />
      )}
    </div>
  );
});
RoomMainView.displayName = 'RoomMainView';
