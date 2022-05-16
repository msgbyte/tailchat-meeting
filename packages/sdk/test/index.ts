import { TailchatMeetingClient } from '../src/index';

const client = new TailchatMeetingClient(
  'wss://light.moonrailgun.com:4433',
  Math.random().toString()
);
client.join('123456789', {
  video: false,
  audio: false,
  displayName: 'foo',
  picture: '',
});

console.log('client', client);
