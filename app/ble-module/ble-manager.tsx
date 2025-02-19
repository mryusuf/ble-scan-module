import { NativeModules, NativeEventEmitter, EmitterSubscription } from "react-native";
export interface Peripheral {
    identifier: string;
    name: string;
    rssi: number;
    advertisementData: any;
}

const { BLEModule } = NativeModules;
const BLEEmitter = new NativeEventEmitter(BLEModule);

class BLEManager {
    // Start scanning for BLE peripherals by invoking the native module's method
    startScanning() {
        BLEModule.startScanning();
    }

    // Stop scanning by invoking the native module's stop method
    stopScanning() {
        BLEModule.stopScanning();
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