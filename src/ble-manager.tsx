import { NativeModules, NativeEventEmitter, EmitterSubscription, Platform } from "react-native";
export interface Peripheral {
    identifier: string;
    name: string;
    rssi: number;
    advertisementData: any;
}

const LINKING_ERROR =
  `The package 'react-native-ble-scan' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const BleScan = NativeModules.BleScan
  ? NativeModules.BleScan
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

const BLEEmitter = new NativeEventEmitter(BleScan);

class BLEManager {
    // Start scanning for BLE peripherals by invoking the native module's method
    startScanning() {
        BleScan.startScanning();
    }

    // Stop scanning by invoking the native module's stop method
    stopScanning() {
        BleScan.stopScanning();
    }

    // Listen for when scanning starts
    onScanStart(callback: () => void): EmitterSubscription {
        return BLEEmitter.addListener('onScanStart', callback);
    }

    // Listen for BLE peripheral discovery events
    onPeripheralFound(callback: (peripheral: Peripheral) => void): EmitterSubscription {
        return BLEEmitter.addListener('onPeripheralFound', callback);
    }

    // Listen for when scanning is unsupported
    onScanUnsupported(callback: () => void): EmitterSubscription {
        return BLEEmitter.addListener('onScanUnsupported', callback);
    }

    // Listen for when scanning is unauthorized
    onScanUnauthorized(callback: () => void): EmitterSubscription {
        return BLEEmitter.addListener('onScanUnauthorized', callback);
    }

    // Listen for when scanning stops
    onScanEnd(callback: () => void): EmitterSubscription {
        return BLEEmitter.addListener('onScanEnd', callback);
    }
}

export default new BLEManager();