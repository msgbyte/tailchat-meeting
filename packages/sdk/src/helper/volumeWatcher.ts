import type { Harker } from 'hark';
import type { Volume } from '../types';
import { EventEmitter } from 'eventemitter-strict';

interface VolumeWatcherEventMap {
  volumeChange: ({ volume, scaledVolume }: Volume) => void;
}

export class VolumeWatcher extends EventEmitter<VolumeWatcherEventMap> {
  private hark: Harker;
  private lastVolume = -100;
  private lastScaledVolume = 0;

  constructor({ hark }: { hark: Harker }) {
    super();

    this.emit('volumeChange', {
      volume: this.lastVolume,
      scaledVolume: this.lastScaledVolume,
    });

    this.hark = hark;

    this.handleHark();
  }

  private handleHark(): void {
    this.hark.on('volume_change', (volume: number) => {
      let newVolume = Math.round(volume);

      if (Math.abs(newVolume - this.lastVolume) > 0.5) {
        if (newVolume < this.lastVolume) {
          newVolume = Math.round(
            this.lastVolume -
              Math.pow(
                (newVolume - this.lastVolume) / (100 + this.lastVolume),
                2
              ) *
                10
          );
        }

        this.lastVolume = newVolume;
        let lastScaledVolume = Math.round(
          ((newVolume - -60) * -100) / -60 / 10
        );

        if (lastScaledVolume < 0) lastScaledVolume = 0;

        this.lastScaledVolume = lastScaledVolume;

        this.emit('volumeChange', {
          volume: newVolume,
          scaledVolume: this.lastScaledVolume,
        });
      }
    });
  }
}
