import { TailchatMeetingClient } from 'tailchat-meeting-sdk';
import { useMeetingState } from '../store/meeting';

let client: TailchatMeetingClient | null = null;

const meetingUrl = process.env.TAILCHAT_MEETING_URL ?? '';

export function useMeetingClient() {
  if (!client) {
    client = new TailchatMeetingClient(meetingUrl);

    client.onWebcamProduce((webcamProducer) => {
      useMeetingState.getState().setProducer({
        webcamProducer,
      });
    });

    client.onWebcamClose(() => {
      useMeetingState.getState().setProducer({
        webcamProducer: null,
      });
    });

    client.onScreenSharingProduce((screenSharingProducer) => {
      useMeetingState.getState().setProducer({
        screenSharingProducer,
      });
    });

    client.onScreenSharingClose(() => {
      useMeetingState.getState().setProducer({
        screenSharingProducer: null,
      });
    });

    client.onMicProduce((micProducer) => {
      useMeetingState.getState().setProducer({
        micProducer,
      });
    });

    client.onMicClose(() => {
      useMeetingState.getState().setProducer({
        micProducer: null,
      });
    });

    client.onPeerJoin((peer) => {
      useMeetingState.getState().peerJoin(peer);
    });

    client.onPeerLeave((peer) => {
      useMeetingState.getState().peerLeave(peer);
    });
  }

  return client;
}
