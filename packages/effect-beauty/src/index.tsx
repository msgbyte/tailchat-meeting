/**
 * 美颜
 */
export function createEffectBeauty() {
  return {
    apply: (stream: MediaStream, virtualBackgroundUrl: string | 'blur') => {
      // const track = virtualBackgroundEffect.start(stream);
      // if (virtualBackgroundUrl === 'blur') {
      //   virtualBackgroundEffect.applyBlur();
      // } else {
      //   virtualBackgroundEffect.applyImageBackground(virtualBackgroundUrl);
      // }
      // return track;
    },
    destroy: () => {
      // virtualBackgroundEffect.stop();
    },
  };
}
