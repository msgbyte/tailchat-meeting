import React from 'react';
import classnames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import EditableInput from '../Controls/EditableInput';
import Logger from '../../features/Logger';
import { yellow, orange, red } from '@material-ui/core/colors';
import SignalCellularOffIcon from '@material-ui/icons/SignalCellularOff';
import SignalCellular0BarIcon from '@material-ui/icons/SignalCellular0Bar';
import SignalCellular1BarIcon from '@material-ui/icons/SignalCellular1Bar';
import SignalCellular2BarIcon from '@material-ui/icons/SignalCellular2Bar';
import SignalCellular3BarIcon from '@material-ui/icons/SignalCellular3Bar';
import { AudioAnalyzer } from './AudioAnalyzer';
import type { Peer } from 'tailchat-meeting-sdk';
import { FormattedMessage } from 'react-intl';

const logger = new Logger('VideoView');

const styles = (theme) => ({
  root: {
    position: 'relative' as const,
    flex: '100 100 auto',
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  },

  video: {
    flex: '100 100 auto',
    height: '100%',
    width: '100%',
    objectFit: 'contain' as const,
    userSelect: 'none' as const,
    transitionProperty: 'opacity',
    transitionDuration: '.15s',
    backgroundColor: 'var(--peer-video-bg-color)',
    '&.isMirrored': {
      transform: 'scaleX(-1)',
    },
    '&.hidden': {
      opacity: 0,
      transitionDuration: '0s',
    },
    '&.loading': {
      filter: 'blur(5px)',
    },
    '&.contain': {
      objectFit: 'contain' as const,
      backgroundColor: 'rgba(0, 0, 0, 1)',
    },
  },
  info: {
    width: '100%',
    height: '100%',
    padding: theme.spacing(1),
    position: 'absolute' as const,
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between',
  },
  media: {
    display: 'flex',
    transitionProperty: 'opacity',
    transitionDuration: '.15s',
    alignItems: 'flex-start',
  },
  box: {
    padding: theme.spacing(0.5),
    borderRadius: 2,
    userSelect: 'none' as const,
    margin: 0,
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.8em',

    '&.left': {
      backgroundColor: 'rgba(0, 0, 0, 0.25)',
      display: 'grid',
      gap: '1px 5px',

      // eslint-disable-next-line
      gridTemplateAreas:
        '\
					"AcodL		Acod	Acod	Acod	Acod" \
					"VcodL		Vcod	Vcod	Vcod	Vcod" \
					"ResL		Res		Res		Res		Res" \
					"VPortL		VPort VPort VPort VPort" \
					"RecvL		RecvBps RecvBps RecvSum RecvSum" \
					"SendL		SendBps SendBps SendSum SendSum" \
					"IPlocL		IPloc	IPloc	IPloc	IPloc" \
					"IPsrvL		IPsrv	IPsrv	IPsrv	IPsrv" \
					"STLcurrL	STLcurr	STLcurr STLcurr STLcurr" \
					"STLprefL	STLpref STLpref STLpref STLpref"',

      '& .AcodL': { gridArea: 'AcodL' },
      '& .Acod': { gridArea: 'Acod' },
      '& .VcodL': { gridArea: 'VcodL' },
      '& .Vcod': { gridArea: 'Vcod' },
      '& .ResL': { gridArea: 'ResL' },
      '& .Res': { gridArea: 'Res' },
      '& .VPortL': { gridArea: 'VPortL' },
      '& .VPort': { gridArea: 'VPort' },
      '& .RecvL': { gridArea: 'RecvL' },
      '& .RecvBps': { gridArea: 'RecvBps', justifySelf: 'flex-end' },
      '& .RecvSum': { gridArea: 'RecvSum', justifySelf: 'flex-end' },
      '& .SendL': { gridArea: 'SendL' },
      '& .SendBps': { gridArea: 'SendBps', justifySelf: 'flex-end' },
      '& .SendSum': { gridArea: 'SendSum', justifySelf: 'flex-end' },
      '& .IPlocL': { gridArea: 'IPlocL' },
      '& .IPloc': { gridArea: 'IPloc' },
      '& .IPsrvL': { gridArea: 'IPsrvL' },
      '& .IPsrv': { gridArea: 'IPsrv' },
      '& .STLcurrL': { gridArea: 'STLcurrL' },
      '& .STLcurr': { gridArea: 'STLcurr' },
      '& .STLprefL': { gridArea: 'STLprefL' },
      '& .STLpref': { gridArea: 'STLpref' },
    },
    '&.right': {
      marginLeft: 'auto',
      width: 30,
    },
    '&.hidden': {
      display: 'none',
    },
    '&.audioAnalyzer': {
      width: '30%',
      height: '30%',
      minWidth: '180px',
      minHeight: '120px',
      marginLeft: theme.spacing(0.5),
      backgroundColor: 'rgba(0, 0, 0, 0.25)',
    },
  },
  peer: {
    display: 'flex',
  },
  displayNameEdit: {
    fontSize: 14,
    fontWeight: 400,
    color: 'rgba(255, 255, 255, 0.85)',
    border: 'none',
    borderBottom: '1px solid #aeff00',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    padding: theme.spacing(0.6),
  },
  displayNameStatic: {
    userSelect: 'none' as const,
    cursor: 'text',
    fontSize: 14,
    fontWeight: 400,
    color: 'rgba(255, 255, 255, 0.85)',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    padding: theme.spacing(0.6),
    '&:hover': {
      backgroundColor: 'rgb(174, 255, 0, 0.25)',
    },
  },
});

interface VideoViewProps {
  peer?: Peer;
  isMe?: boolean;
  isMirrored?: boolean;
  isScreen?: boolean;
  isExtraVideo?: boolean;
  showQuality?: boolean;
  showAudioAnalyzer?: boolean;
  displayName?: string;
  showPeerInfo?: boolean;
  videoContain?: boolean;
  advancedMode?: boolean;
  videoTrack?: any;
  videoVisible: boolean;
  audioTrack?: any;
  consumerSpatialLayers?: number;
  consumerTemporalLayers?: number;
  consumerCurrentSpatialLayer?: number;
  consumerCurrentTemporalLayer?: number;
  consumerPreferredSpatialLayer?: number;
  consumerPreferredTemporalLayer?: number;
  videoMultiLayer?: boolean;
  audioScore?: any;
  videoScore?: any;
  audioCodec?: string;
  videoCodec?: string;
  onChangeDisplayName?: (newDisplayName: string) => void;
  classes: any;
  netInfo?: any;
  width?: number;
  height?: number;
  opusConfig?: string;
  localRecordingState?: string;
  recordingConsents?: any[];
}
class VideoView extends React.PureComponent<VideoViewProps> {
  state = {
    videoWidth: null,
    videoHeight: null,
  };

  // Latest received video track.
  // @type {MediaStreamTrack}
  _videoTrack = null;

  // Latest received audio track.
  // @type {MediaStreamTrack}
  _audioTrack = null;

  // Periodic timer for showing video resolution.
  _videoResolutionTimer = null;

  audioAnalyzer: AudioAnalyzer = null;

  // Audio Analyzer
  audioAnalyzerContainer = React.createRef<HTMLDivElement>();

  videoElement = React.createRef<HTMLVideoElement>();

  render() {
    const {
      isMe,
      isMirrored,
      isScreen,
      isExtraVideo,
      showQuality,
      showAudioAnalyzer,
      displayName,
      showPeerInfo,
      videoContain,
      advancedMode,
      videoVisible,
      videoMultiLayer,
      audioScore,
      videoScore,
      consumerCurrentSpatialLayer,
      consumerCurrentTemporalLayer,
      consumerPreferredSpatialLayer,
      consumerPreferredTemporalLayer,
      audioCodec,
      videoCodec,
      onChangeDisplayName,
      children,
      classes,
      netInfo,
      width,
      height,
      opusConfig,
      localRecordingState,
      recordingConsents,
      peer,
    } = this.props;

    const { videoWidth, videoHeight } = this.state;

    let quality = null;

    if (showQuality) {
      quality = <SignalCellularOffIcon style={{ color: red[500] }} />;

      if (videoScore || audioScore) {
        const score = videoScore ? videoScore : audioScore;

        switch (isMe ? score.score : score.producerScore) {
          case 0:
          case 1: {
            quality = <SignalCellular0BarIcon style={{ color: red[500] }} />;

            break;
          }

          case 2:
          case 3: {
            quality = <SignalCellular1BarIcon style={{ color: red[500] }} />;

            break;
          }

          case 4:
          case 5:
          case 6: {
            quality = <SignalCellular2BarIcon style={{ color: orange[500] }} />;

            break;
          }

          case 7:
          case 8:
          case 9: {
            quality = <SignalCellular3BarIcon style={{ color: yellow[500] }} />;

            break;
          }

          case 10: {
            quality = null;

            break;
          }

          default: {
            break;
          }
        }
      }
    }

    return (
      <div className={classes.root}>
        <div className={classes.info}>
          <div className={classes.media}>
            {(audioCodec || videoCodec) && (
              <div
                className={classnames(classes.box, 'left', {
                  hidden: !advancedMode,
                })}
              >
                {audioCodec && (
                  <React.Fragment>
                    <span className={'AcodL'}>Acod: </span>
                    <span className={'Acod'}>
                      {audioCodec} {opusConfig}
                    </span>
                  </React.Fragment>
                )}

                {videoCodec && (
                  <React.Fragment>
                    <span className={'VcodL'}>Vcod: </span>
                    <span className={'Vcod'}>{videoCodec}</span>
                  </React.Fragment>
                )}

                {videoVisible && videoWidth !== null && (
                  <React.Fragment>
                    <span className={'ResL'}>Res: </span>
                    <span className={'Res'}>
                      {videoWidth}x{videoHeight}
                    </span>
                  </React.Fragment>
                )}

                {videoVisible && width && height && (
                  <React.Fragment>
                    <span className={'VPortL'}>VPort: </span>
                    <span className={'VPort'}>
                      {Math.round(width)}x{Math.round(height)}
                    </span>
                  </React.Fragment>
                )}

                {isMe &&
                  !isScreen &&
                  !isExtraVideo &&
                  netInfo.recv &&
                  netInfo.send &&
                  netInfo.send.iceSelectedTuple && (
                    <React.Fragment>
                      <span className={'RecvL'}>Recv: </span>
                      <span className={'RecvBps'}>
                        {(netInfo.recv.sendBitrate / 1024 / 1024).toFixed(2)}
                        Mb/s
                      </span>
                      <span className={'RecvSum'}>
                        {(netInfo.recv.bytesSent / 1024 / 1024).toFixed(2)}MB
                      </span>

                      <span className={'SendL'}>Send: </span>
                      <span className={'SendBps'}>
                        {(netInfo.send.recvBitrate / 1024 / 1024).toFixed(2)}
                        Mb/s
                      </span>
                      <span className={'SendSum'}>
                        {(netInfo.send.bytesReceived / 1024 / 1024).toFixed(2)}
                        MB
                      </span>

                      <span className={'IPlocL'}>IPloc: </span>
                      <span className={'IPloc'}>
                        {netInfo.send.iceSelectedTuple.remoteIp}
                      </span>

                      <span className={'IPsrvL'}>IPsrv: </span>
                      <span className={'IPsrv'}>
                        {netInfo.send.iceSelectedTuple.localIp}
                      </span>
                    </React.Fragment>
                  )}

                {videoMultiLayer && (
                  <React.Fragment>
                    <span className={'STLcurrL'}>STLcurr: </span>
                    <span className={'STLcurr'}>
                      {consumerCurrentSpatialLayer}{' '}
                      {consumerCurrentTemporalLayer}
                    </span>

                    <span className={'STLprefL'}>STLpref: </span>
                    <span className={'STLpref'}>
                      {consumerPreferredSpatialLayer}{' '}
                      {consumerPreferredTemporalLayer}
                    </span>
                  </React.Fragment>
                )}
              </div>
            )}

            {showAudioAnalyzer && advancedMode && (
              <div
                className={classnames(classes.box, 'audioAnalyzer')}
                ref={this.audioAnalyzerContainer}
              />
            )}

            {showQuality && (
              <div className={classnames(classes.box, 'right')}>{quality}</div>
            )}
          </div>

          {showPeerInfo && (
            <div className={classes.peer}>
              <div className={classes.box}>
                {isMe ? (
                  <React.Fragment>
                    <EditableInput
                      value={displayName}
                      propName="newDisplayName"
                      className={classes.displayNameEdit}
                      classLoading="loading"
                      classInvalid="invalid"
                      shouldBlockWhileLoading
                      editProps={{
                        maxLength: 30,
                        autoCorrect: 'off',
                        spellCheck: false,
                      }}
                      onChange={({ newDisplayName }) =>
                        onChangeDisplayName(newDisplayName)
                      }
                    />
                  </React.Fragment>
                ) : (
                  <span className={classes.displayNameStatic}>
                    {(localRecordingState === 'start' ||
                      localRecordingState === 'resume') &&
                    !recordingConsents.includes(peer.id)
                      ? ''
                      : displayName}
                  </span>
                )}

                {!peer.from && (
                  <span className={classes.displayNameStatic}>
                    <FormattedMessage
                      id="label.unauthenticated"
                      defaultMessage="Unauthenticated"
                    />
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <video
          ref={this.videoElement}
          className={classnames(classes.video, {
            hidden:
              !videoVisible ||
              (!isMe &&
                (localRecordingState === 'start' ||
                  localRecordingState === 'resume') &&
                !recordingConsents.includes(peer.id)),
            isMirrored: isMirrored,
            contain: videoContain,
          })}
          autoPlay
          playsInline
          muted
          controls={false}
        />

        {children}
      </div>
    );
  }

  componentDidMount() {
    const { videoTrack, audioTrack, showAudioAnalyzer } = this.props;

    this._setTracks(videoTrack);

    // Audio analyzer
    if (showAudioAnalyzer && this.props.advancedMode) {
      this._setAudioMonitorTrack(audioTrack);
    } else if (this.audioAnalyzer) {
      this.audioAnalyzer.delete();
      this.audioAnalyzer = null;
    }
  }

  componentWillUnmount() {
    clearInterval(this._videoResolutionTimer);

    const videoElement = this.videoElement.current;

    if (videoElement) {
      videoElement.oncanplay = null;
      videoElement.onplay = null;
      videoElement.onpause = null;
    }

    if (this.audioAnalyzer) {
      this.audioAnalyzer.delete();
      this.audioAnalyzer = null;
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      const { videoTrack, audioTrack, showAudioAnalyzer } = this.props;

      this._setTracks(videoTrack);

      if (showAudioAnalyzer && this.props.advancedMode) {
        this._setAudioMonitorTrack(audioTrack);
      } else if (this.audioAnalyzer) {
        this.audioAnalyzer.delete();
        this.audioAnalyzer = null;
      }
    }
  }

  _setTracks(videoTrack) {
    if (this._videoTrack === videoTrack) return;

    this._videoTrack = videoTrack;

    clearInterval(this._videoResolutionTimer);
    this._hideVideoResolution();

    const videoElement = this.videoElement.current;

    if (videoTrack) {
      const stream = new MediaStream();

      stream.addTrack(videoTrack);

      videoElement.srcObject = stream;

      videoElement.oncanplay = () => this.setState({ videoCanPlay: true });

      videoElement
        .play()
        .catch((error) =>
          logger.warn('videoElement.play() [error:"%o]', error)
        );

      this._showVideoResolution();
    } else {
      videoElement.srcObject = null;
    }
  }

  _setAudioMonitorTrack(track) {
    if (!this.audioAnalyzer) {
      logger.debug(
        '_setAudioMonitorTrack creating audioAnalyzer with dom:',
        this.audioAnalyzerContainer.current
      );
      this.audioAnalyzer = new AudioAnalyzer(
        this.audioAnalyzerContainer.current
      );
    }

    if (track) {
      this.audioAnalyzer.addTrack(track);
    } else {
      // disconnects all the tracks
      this.audioAnalyzer.removeTracks();
    }
  }

  _showVideoResolution() {
    this._videoResolutionTimer = setInterval(() => {
      const { videoWidth, videoHeight } = this.state;
      const videoElement = this.videoElement.current;

      // Don't re-render if nothing changed.
      if (
        videoElement.videoWidth === videoWidth &&
        videoElement.videoHeight === videoHeight
      )
        return;

      this.setState({
        videoWidth: videoElement.videoWidth,
        videoHeight: videoElement.videoHeight,
      });
    }, 1000);
  }

  _hideVideoResolution() {
    this.setState({ videoWidth: null, videoHeight: null });
  }

  menuAnchorElement = null;
  handleMenuClick(event) {
    logger.debug('handleMenuClick', event.currentTarget);

    this.menuAnchorElement = event.currentTarget;
  }

  handleMenuClose(event) {
    logger.debug('handleMenuClose', event.currentTarget);

    this.menuAnchorElement = null;
  }
}

export default withStyles(styles)(VideoView);
