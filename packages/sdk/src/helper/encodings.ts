import type {
  RtpCapabilities,
  RtpEncodingParameters,
} from 'mediasoup-client/lib/RtpParameters';
import type { SimulcastProfile } from '../types';

// Used for VP9 webcam video.
const VIDEO_KSVC_ENCODINGS: RtpEncodingParameters[] = [
  { scalabilityMode: 'S3T3_KEY' },
];

// Used for VP9 desktop sharing.
const VIDEO_SVC_ENCODINGS: RtpEncodingParameters[] = [
  { scalabilityMode: 'S3T3', dtx: true },
];

/**
 * 获取编码参数
 */
export const getEncodings = (
  rtpCapabilities: RtpCapabilities,
  simulcastProfiles: Record<string, SimulcastProfile[]>,
  width: number | undefined,
  height: number | undefined,
  screenSharing?: boolean
): RtpEncodingParameters[] => {
  if (!width || !height) {
    throw new Error('missing width or height');
  }

  // If VP9 is the only available video codec then use SVC.
  const firstVideoCodec = rtpCapabilities.codecs?.find(
    (c) => c.kind === 'video'
  );

  if (!firstVideoCodec) {
    throw new Error('No video codecs');
  }

  let encodings: RtpEncodingParameters[];
  const size = width > height ? width : height;

  if (firstVideoCodec.mimeType.toLowerCase() === 'video/vp9') {
    encodings = screenSharing ? VIDEO_SVC_ENCODINGS : VIDEO_KSVC_ENCODINGS;
  } else {
    encodings = chooseEncodings(simulcastProfiles, size);
  }

  return encodings;
};

/**
 * 根据大小选择编码
 */
const chooseEncodings = (
  simulcastProfiles: Record<string, SimulcastProfile[]>,
  size: number
): RtpEncodingParameters[] => {
  let encodings: RtpEncodingParameters[] = [];

  const sortedMap = new Map(
    [...Object.entries(simulcastProfiles)].sort(
      (a, b) => parseInt(b[0]) - parseInt(a[0])
    )
  );

  for (const [key, value] of sortedMap) {
    if (parseInt(key) < size) {
      if (encodings === null) {
        encodings = value;
      }

      break;
    }

    encodings = value;
  }

  // hack as there is a bug in mediasoup
  if (encodings.length === 1) {
    encodings.push({ ...encodings[0] });
  }

  return encodings;
};
