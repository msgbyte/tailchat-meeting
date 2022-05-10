import React, { useEffect } from 'react';
import { peerConsumerSelector, useAppSelector } from '../../store/selectors';
import classnames from 'classnames';
import { useRoomClient } from '../../RoomContext';
import { makeStyles } from '@material-ui/core/styles';
import { FormattedMessage } from 'react-intl';
import VideoView from '../VideoContainers/VideoView';
import Volume from './Volume';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
  },
  viewRoot: {
    flex: '0 0 auto',
    boxShadow: 'var(--peer-shadow)',
    border: 'var(--peer-border)',
    touchAction: 'none',
    backgroundColor: 'var(--peer-bg-color)',
    backgroundImage: 'var(--peer-empty-avatar)',
    backgroundPosition: 'bottom',
    backgroundSize: 'auto 85%',
    backgroundRepeat: 'no-repeat',
    '&.webcam': {
      order: 2,
    },
    '&.screen': {
      order: 1,
    },
  },

  viewContainer: {
    position: 'relative',
  },
  webcamThumbnail: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    transform: 'scale(0.25)',
    transformOrigin: '100% 100%',
  },
  videoInfo: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(1),
    zIndex: 21,
    '& p': {
      padding: '6px 12px',
      borderRadius: 6,
      userSelect: 'none',
      pointerEvents: 'none',
      fontSize: 20,
      color: 'rgba(255, 255, 255, 0.55)',
    },
  },
}));

export const SpeakerPeer: React.FC<{
  id: string;
  advancedMode: boolean;
  style: React.CSSProperties;
}> = React.memo((props) => {
  const { id, advancedMode, style } = props;

  const roomClient = useRoomClient();

  const { micConsumer, webcamConsumer, screenConsumer } = useAppSelector(
    (state) => peerConsumerSelector(state, id)
  );
  const peer = useAppSelector((state) => state.peers[id]);
  const windowConsumer = useAppSelector((state) => state.room.windowConsumer);
  const fullScreenConsumer = useAppSelector(
    (state) => state.room.fullScreenConsumer
  );

  const classes = useStyles();

  const width = style.width;

  const height = style.height;

  const videoVisible =
    Boolean(webcamConsumer) &&
    !webcamConsumer.locallyPaused &&
    !webcamConsumer.remotelyPaused;

  const screenVisible =
    Boolean(screenConsumer) &&
    !screenConsumer.locallyPaused &&
    !screenConsumer.remotelyPaused;

  useEffect(() => {
    const handler = setTimeout(() => {
      const consumer = webcamConsumer || screenConsumer;

      if (!consumer) return;

      if (windowConsumer === consumer.id) {
        // if playing in external window, set the maximum quality levels
        roomClient.setConsumerPreferredLayersMax(consumer);
      } else if (
        webcamConsumer?.type !== 'simple' &&
        fullScreenConsumer !== consumer.id
      ) {
        roomClient.adaptConsumerPreferredLayers(consumer, width, height);
      }
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [
    webcamConsumer,
    screenConsumer,
    windowConsumer,
    fullScreenConsumer,
    roomClient,
    width,
    height,
  ]);

  const isSharing = Boolean(screenConsumer);
  const showWebcamView = !isSharing || videoVisible;

  return (
    <div className={classnames(classes.root)}>
      {screenConsumer && (
        <div className={classnames(classes.viewRoot, 'screen')}>
          {!screenVisible && (
            <div className={classes.videoInfo} style={style}>
              <p>
                <FormattedMessage
                  id="room.videoPaused"
                  defaultMessage="This video is paused"
                />
              </p>
            </div>
          )}

          {screenVisible && (
            <div className={classnames(classes.viewContainer)} style={style}>
              <VideoView
                advancedMode={advancedMode}
                videoContain
                consumerSpatialLayers={
                  screenConsumer ? screenConsumer.spatialLayers : null
                }
                consumerTemporalLayers={
                  screenConsumer ? screenConsumer.temporalLayers : null
                }
                consumerCurrentSpatialLayer={
                  screenConsumer ? screenConsumer.currentSpatialLayer : null
                }
                consumerCurrentTemporalLayer={
                  screenConsumer ? screenConsumer.currentTemporalLayer : null
                }
                consumerPreferredSpatialLayer={
                  screenConsumer ? screenConsumer.preferredSpatialLayer : null
                }
                consumerPreferredTemporalLayer={
                  screenConsumer ? screenConsumer.preferredTemporalLayer : null
                }
                videoMultiLayer={
                  screenConsumer && screenConsumer.type !== 'simple'
                }
                videoTrack={screenConsumer && screenConsumer.track}
                videoVisible={screenVisible}
                videoCodec={screenConsumer && screenConsumer.codec}
                videoScore={screenConsumer ? screenConsumer.score : null}
              />
            </div>
          )}
        </div>
      )}

      {showWebcamView && (
        <div
          className={classnames(classes.viewRoot, 'webcam', {
            [classes.webcamThumbnail]: isSharing,
          })}
        >
          <div className={classnames(classes.viewContainer)} style={style}>
            {!videoVisible && (
              <div className={classes.videoInfo}>
                <p>
                  <FormattedMessage
                    id="room.videoPaused"
                    defaultMessage="This video is paused"
                  />
                </p>
              </div>
            )}

            <VideoView
              advancedMode={advancedMode}
              peer={peer}
              displayName={peer.displayName}
              showPeerInfo
              consumerSpatialLayers={
                webcamConsumer ? webcamConsumer.spatialLayers : null
              }
              consumerTemporalLayers={
                webcamConsumer ? webcamConsumer.temporalLayers : null
              }
              consumerCurrentSpatialLayer={
                webcamConsumer ? webcamConsumer.currentSpatialLayer : null
              }
              consumerCurrentTemporalLayer={
                webcamConsumer ? webcamConsumer.currentTemporalLayer : null
              }
              consumerPreferredSpatialLayer={
                webcamConsumer ? webcamConsumer.preferredSpatialLayer : null
              }
              consumerPreferredTemporalLayer={
                webcamConsumer ? webcamConsumer.preferredTemporalLayer : null
              }
              videoMultiLayer={
                webcamConsumer && webcamConsumer.type !== 'simple'
              }
              videoTrack={webcamConsumer && webcamConsumer.track}
              videoVisible={videoVisible}
              audioCodec={micConsumer && micConsumer.codec}
              videoCodec={webcamConsumer && webcamConsumer.codec}
              audioScore={micConsumer ? micConsumer.score : null}
              videoScore={webcamConsumer ? webcamConsumer.score : null}
              width={width}
              height={height}
              opusConfig={micConsumer && micConsumer.opusConfig}
            >
              <Volume id={peer.id} />
            </VideoView>
          </div>
        </div>
      )}
    </div>
  );
});
SpeakerPeer.displayName = 'SpeakerPeer';
