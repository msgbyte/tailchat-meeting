import WebTorrent, { Torrent } from 'webtorrent';
import { store } from '../store/store';
import Logger from './Logger';
import * as requestActions from '../store/actions/requestActions';
import { intl } from '../intl';
import { filesActions } from '../store/slices/files';
import createTorrent from 'create-torrent';
import type { ChatMessage } from '../store/slices/chat';
import type { RoomClient } from '../RoomClient';

const logger = new Logger('FileShare');

export class FileShare {
  torrentSupport = WebTorrent.WEBRTC_SUPPORT;
  webTorrent: WebTorrent.Instance;
  tracker = 'wss://tracker.lab.vvc.niif.hu:443';

  constructor(public client: RoomClient) {
    this.webTorrent =
      this.torrentSupport &&
      new WebTorrent({
        tracker: {
          rtcConfig: {
            iceServers: client._turnServers,
          },
        },
      });

    this.webTorrent.on('error', (error) => {
      logger.error('Filesharing [error:"%o"]', error);

      store.dispatch(
        requestActions.notify({
          type: 'error',
          text: intl.formatMessage({
            id: 'filesharing.error',
            defaultMessage: 'There was a filesharing error',
          }),
        })
      );
    });
  }

  shareFiles(data: ChatMessage) {
    store.dispatch(
      requestActions.notify({
        text: intl.formatMessage({
          id: 'filesharing.startingFileShare',
          defaultMessage: 'Attempting to share file',
        }),
      })
    );

    createTorrent(data.attachment, (err, torrent) => {
      if (err) {
        store.dispatch(
          requestActions.notify({
            type: 'error',
            text: intl.formatMessage({
              id: 'filesharing.unableToShare',
              defaultMessage: 'Unable to share file',
            }),
          })
        );

        return;
      }

      const existingTorrent = this.webTorrent.get(torrent);
      if (existingTorrent) {
        store.dispatch(
          requestActions.notify({
            text: intl.formatMessage({
              id: 'filesharing.successfulFileShare',
              defaultMessage: 'File successfully shared',
            }),
          })
        );

        const file = {
          ...data,
          peerId: this.client._peerId,
          magnetUri: existingTorrent.magnetURI,
        };

        store.dispatch(filesActions.addFile(file));
        this.sendFile(file);
        return;
      }

      this.webTorrent.seed(
        data.attachment,
        { announceList: [[this.tracker]] },
        (newTorrent) => {
          store.dispatch(
            requestActions.notify({
              text: intl.formatMessage({
                id: 'filesharing.successfulFileShare',
                defaultMessage: 'File successfully shared',
              }),
            })
          );

          const file = {
            ...data,
            peerId: this.client._peerId,
            magnetUri: newTorrent.magnetURI,
          };

          store.dispatch(filesActions.addFile(file));
          this.sendFile(file);
        }
      );
    });
  }

  private async sendFile(file: any) {
    logger.debug('sendFile() [magnetUri:"%o"]', file.magnetUri);

    try {
      await this.client.sendRequest('sendFile', file);
    } catch (error) {
      logger.error('sendFile() [error:"%o"]', error);

      store.dispatch(
        requestActions.notify({
          type: 'error',
          text: intl.formatMessage({
            id: 'filesharing.unableToShare',
            defaultMessage: 'Unable to share file',
          }),
        })
      );
    }
  }

  download(magnetUri: string) {
    store.dispatch(filesActions.setFileActive(magnetUri));

    const existingTorrent = this.webTorrent.get(magnetUri);

    if (existingTorrent) {
      // Never add duplicate torrents, use the existing one instead.
      this.handleTorrent(existingTorrent);

      return;
    }

    this.webTorrent.add(magnetUri, this.handleTorrent);
  }

  private handleTorrent(torrent: Torrent) {
    // Torrent already done, this can happen if the
    // same file was sent multiple times.
    if (torrent.progress === 1) {
      store.dispatch(
        filesActions.setFileDone({
          magnetUri: torrent.magnetURI,
          sharedFiles: torrent.files,
        })
      );

      return;
    }

    // let lastMove = 0;

    torrent.on('download', () => {
      // if (Date.now() - lastMove > 1000)
      // {
      store.dispatch(
        filesActions.setFileProgress({
          magnetUri: torrent.magnetURI,
          progress: torrent.progress,
        })
      );

      // lastMove = Date.now();
      // }
    });

    torrent.on('done', () => {
      store.dispatch(
        filesActions.setFileDone({
          magnetUri: torrent.magnetURI,
          sharedFiles: torrent.files,
        })
      );
    });
  }
}
