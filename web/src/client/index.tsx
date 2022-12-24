import { TailchatMeetingClient } from 'tailchat-meeting-sdk';

let client: TailchatMeetingClient | null = null;

const meetingUrl = process.env.TAILCHAT_MEETING_URL ?? '';

export function useMeetingClient() {
  if (!client) {
    client = new TailchatMeetingClient(meetingUrl);
  }

  return client;
}
