import type { VideoResolutionType } from './types';

export const PC_PROPRIETARY_CONSTRAINTS = {
  optional: [{ googDscp: true }],
};

export const VIDEO_CONSTRAINS: Record<VideoResolutionType, { width: number }> =
  {
    low: {
      width: 320,
    },
    medium: {
      width: 640,
    },
    high: {
      width: 1280,
    },
    veryhigh: {
      width: 1920,
    },
    ultra: {
      width: 3840,
    },
  };

export function getVideoConstrains(
  resolution: keyof typeof VIDEO_CONSTRAINS,
  aspectRatio: number
) {
  return {
    width: { ideal: VIDEO_CONSTRAINS[resolution].width },
    height: { ideal: VIDEO_CONSTRAINS[resolution].width / aspectRatio },
  };
}
