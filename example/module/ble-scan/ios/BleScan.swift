import CoreBluetooth
import React

enum ScanState: String, CaseIterable {
  case onScanStart
  case onPeripheralFound
  case onScanEnd
  case onScanUnsupported
  case onScanUnauthorized
  case unknown
}

@objc(BleScan)
class BleScan: RCTEventEmitter {
  private var centralManager: CBCentralManager?
  private var discoveredPeripherals: [UUID: CBPeripheral] = [:]
  
  override func supportedEvents() -> [String]! {
    ScanState.allCases.map(\.rawValue)
  }
  
  @objc override static func requiresMainQueueSetup() -> Bool {
    true
  }
  
}

// MARK: - Public Methods

extension BleScan {
  @objc public func startScanning() {
    if centralManager == nil {
      centralManager = CBCentralManager(delegate: self,
                                        queue: nil)
    } else if centralManager?.state == .poweredOn {
      sendEvent(withName: ScanState.onScanStart.rawValue,
                body: nil)
      centralManager?.scanForPeripherals(withServices: nil,
                                         options: nil)
    }
  }
  
  @objc public func stopScanning() {
    centralManager?.stopScan()
    sendEvent(withName: ScanState.onScanEnd.rawValue, body: nil)
  }
  
}


// MARK: - CoreBluetooth Central Manager Delegate Methods

extension BleScan: CBCentralManagerDelegate {
  func centralManagerDidUpdateState(_ central: CBCentralManager) {
    switch central.state {
    case .poweredOn:
      sendEvent(withName: ScanState.onScanStart.rawValue,
                body: nil)
      central.scanForPeripherals(withServices: nil,
                                 options: nil)
    case .unauthorized:
      sendEvent(withName: ScanState.onScanUnauthorized.rawValue,
                body: nil)
    case .unsupported:
      sendEvent(withName: ScanState.onScanUnsupported.rawValue,
                body: nil)
    default:
      sendEvent(withName: ScanState.unknown.rawValue,
                body: nil)
    }
  }
  
  func centralManager(_ central: CBCentralManager,
                      didDiscover peripheral: CBPeripheral,
                      advertisementData: [String: Any],
                      rssi RSSI: NSNumber) {
    discoveredPeripherals[peripheral.identifier] = peripheral
    
    let peripheralName: String? = peripheral.name ?? advertisementData[CBAdvertisementDataLocalNameKey] as? String

    let peripheralData: [String: Any] = [
      "identifier": peripheral.identifier.uuidString,
      "name": peripheralName ?? "Unknown - no name",
      "rssi": RSSI,
      "advertisementData": advertisementData
    ]
    
    sendEvent(withName: ScanState.onPeripheralFound.rawValue,
              body: peripheralData)
  }
}
