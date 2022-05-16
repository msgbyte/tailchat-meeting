import EventEmitter from 'events';
import Logger from '../helper/logger';

const logger = new Logger('DeviceClient');

export interface MediaDevice {
  deviceId: string;
  kind: MediaDeviceKind;
  label: string;
}

export interface DevicesUpdated {
  devices: MediaDeviceInfo[];
  removedDevices: MediaDeviceInfo[];
  newDevices: MediaDeviceInfo[];
}

export declare interface DeviceClient {
  // eslint-disable-next-line no-unused-vars
  on(
    event: 'devicesUpdated',
    listener: (updatedDevices: DevicesUpdated) => void
  ): this;
}

export class DeviceClient extends EventEmitter {
  private devices: MediaDevice[] = [];

  public async updateMediaDevices(): Promise<void> {
    logger.debug('updateMediaDevices()');

    let removedDevices: MediaDevice[];
    let newDevices: MediaDevice[];

    try {
      const devicesList = (await navigator.mediaDevices.enumerateDevices())
        .filter((d) => d.deviceId)
        .map((d) => ({ deviceId: d.deviceId, kind: d.kind, label: d.label }));

      if (devicesList.length === 0) return;

      removedDevices = this.devices.filter(
        (device) => !devicesList.find((d) => d.deviceId === device.deviceId)
      );

      newDevices = devicesList.filter(
        (device) => !this.devices.find((d) => d.deviceId === device.deviceId)
      );

      this.devices = devicesList;

      this.emit('devicesUpdated', {
        devices: this.devices,
        removedDevices,
        newDevices,
      });
    } catch (error) {
      logger.error('updateMediaDevices() [error:%o]', error);
    }
  }

  public getDeviceId(
    deviceId: string,
    kind: MediaDeviceKind
  ): string | undefined {
    let device = this.devices.find((d) => d.deviceId === deviceId);

    if (!device) {
      device = this.devices.find((d) => d.kind === kind);
    }

    return device?.deviceId;
  }
}
