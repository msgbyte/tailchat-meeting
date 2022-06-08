import { EventEmitter } from 'eventemitter-strict';
import { Logger } from '../helper/logger';

const logger = new Logger('DeviceClient');

export interface DevicesUpdated {
  devices: MediaDeviceInfo[];
  removedDevices: MediaDeviceInfo[];
  newDevices: MediaDeviceInfo[];
}

interface DeviceClientEventMap {
  devicesUpdated: (updatedDevices: DevicesUpdated) => void;
}

export class DeviceClient extends EventEmitter<DeviceClientEventMap> {
  private devices: MediaDeviceInfo[] = [];

  get allDevices() {
    return this.devices;
  }

  public async updateMediaDevices(): Promise<void> {
    logger.debug('updateMediaDevices()');

    let removedDevices: MediaDeviceInfo[];
    let newDevices: MediaDeviceInfo[];

    try {
      const devicesList = (
        await navigator.mediaDevices.enumerateDevices()
      ).filter((d) => d.deviceId);

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
