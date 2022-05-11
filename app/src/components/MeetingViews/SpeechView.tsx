import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useDebounce } from 'ahooks';
import classnames from 'classnames';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useResize } from '../../hooks/useResize';
import { useActivePeerId } from '../../store/hooks/useActivePeerId';
import { useSelectedPeerId } from '../../store/hooks/useSelectedPeerId';
import { useAppSelector } from '../../store/selectors';
import { calcBoxSizeWithContainer } from '../../utils';
import Me from '../Containers/Me';
import Peer from '../Containers/Peer';
import { SpeakerPeer } from '../Containers/SpeakerPeer';

const PADDING_V = 64;

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    width: '100%',
    overflow: 'hidden',
    display: 'flex',
  },
  hiddenToolBar: {
    paddingTop: 0,
    transition: 'padding .5s',
  },
  showingToolBar: {
    paddingTop: PADDING_V,
    transition: 'padding .5s',
  },
  speaker: {
    flex: 1,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  participantContainer: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  participant: {
    display: 'flex',
    flexDirection: 'column',
    border: 'var(--peer-border)',
    '&.selected': {
      borderColor: 'var(--selected-peer-border-color)',
    },
    '&.active': {
      borderColor: 'var(--selected-peer-border-color)',
    },
  },
}));

/**
 * 演讲者试图
 *
 * 左边一个主屏右边一列缩略图
 *
 * 用于某些正在共享屏幕的情况
 */
export const SpeechView: React.FC = React.memo(() => {
  const classes = useStyles();
  const showToolbar = useAppSelector(
    (state) => state.room.toolbarsVisible || state.settings.permanentTopBar
  );
  const selectedPeerId = useSelectedPeerId();
  const activePeerId = useActivePeerId();
  const advancedMode = useAppSelector((state) => state.settings.advancedMode);
  const peers = useAppSelector((state) => state.peers);
  const spotlights = useAppSelector((state) => state.room.spotlights);
  const hideSelfView = useAppSelector((state) => state.room.hideSelfView);
  const myId = useAppSelector((state) => state.me.id);
  const aspectRatio = useAppSelector((state) => state.settings.aspectRatio);
  const peerSize = useMemo(
    () => ({
      width: 300,
      height: 150,
    }),
    []
  );
  const speakerContainerRef = useRef<HTMLDivElement>(null);
  const [speakerSize, setSpeakerSize] = useState<
    Pick<React.CSSProperties, 'width' | 'height'>
  >({ width: 'auto', height: 'auto' });

  /**
   * 更新演讲者画面大小
   */
  const updateSpeakerViewSize = useCallback(() => {
    if (!speakerContainerRef.current) {
      return;
    }

    const { width: containerWidth, height: containerHeight } =
      speakerContainerRef.current.getBoundingClientRect();

    const { width, height } = calcBoxSizeWithContainer(
      containerWidth,
      containerHeight,
      aspectRatio
    );

    setSpeakerSize({
      width,
      height,
    });
  }, [aspectRatio]);
  useEffect(updateSpeakerViewSize, []);
  useResize(updateSpeakerViewSize);

  const debouncedSpeakerSize = useDebounce(speakerSize);

  return (
    <div
      className={classnames(
        classes.root,
        showToolbar ? classes.showingToolBar : classes.hiddenToolBar
      )}
    >
      <div className={classes.speaker} ref={speakerContainerRef}>
        {peers[activePeerId] && (
          <SpeakerPeer
            advancedMode={advancedMode}
            id={activePeerId}
            style={debouncedSpeakerSize}
          />
        )}
      </div>

      <div className={classes.participantContainer}>
        <Grid container justifyContent="center" direction="column" spacing={1}>
          <Grid item>
            <div
              className={classnames(classes.participant, {
                active: myId === activePeerId,
              })}
            >
              {!hideSelfView && (
                <Me advancedMode={advancedMode} style={peerSize} />
              )}
            </div>
          </Grid>

          {Object.keys(peers).map((peerId) => {
            if (
              spotlights.find(
                (spotlightsElement) => spotlightsElement === peerId
              )
            ) {
              return (
                <Grid key={peerId} item>
                  <div
                    key={peerId}
                    className={classnames(classes.participant, {
                      selected: selectedPeerId === peerId,
                      active: peerId === activePeerId,
                    })}
                  >
                    <Peer
                      advancedMode={advancedMode}
                      id={peerId}
                      style={peerSize}
                      enableLayersSwitch={activePeerId !== peerId}
                    />
                  </div>
                </Grid>
              );
            } else {
              return '';
            }
          })}
        </Grid>
      </div>
    </div>
  );
});
SpeechView.displayName = 'SpeechView';
