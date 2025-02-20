package com.blescan

import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.bluetooth.le.BluetoothLeScanner
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanResult
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule

class BleScanModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  // Bluetooth adapter and BLE scanner references.
  private var bluetoothAdapter: BluetoothAdapter? = null
  private var bleScanner: BluetoothLeScanner? = null
  private var isScanning: Boolean = false

  init {
      val bluetoothManager = reactContext.getSystemService(ReactApplicationContext.BLUETOOTH_SERVICE) as BluetoothManager
      bluetoothAdapter = bluetoothManager.adapter
      bleScanner = bluetoothAdapter?.bluetoothLeScanner
  }

  override fun getName(): String {
    return NAME
  }

  private fun sendEvent(eventName: String, params: Any?) {
      reactApplicationContext
          .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
          .emit(eventName, params)
  }

  // Exposed method to start BLE scanning.
  @ReactMethod
  public fun startScanning() {
      if (bluetoothAdapter == null || !bluetoothAdapter!!.isEnabled) {
          sendEvent("onError", "Bluetooth is disabled or not available.")
          return
      }

      isScanning = true
      sendEvent("onScanStart", null)
      bleScanner?.startScan(scanCallback)
  }

  // Exposed method to stop BLE scanning.
  @ReactMethod
  public fun stopScanning() {
      if (!isScanning) return

      bleScanner?.stopScan(scanCallback)
      isScanning = false
      sendEvent("onScanEnd", null)
  }

  private val scanCallback = object : ScanCallback() {
      override fun onScanResult(callbackType: Int, result: ScanResult?) {
          result?.let {
              val device = it.device
              val scanRecord = it.scanRecord
              val deviceName = device.name ?: scanRecord?.deviceName ?: "Unknown"
              // Convert advertisement data to a hex string.
              val advertisementData = scanRecord?.bytes?.let { bytes -> bytesToHex(bytes) } ?: ""

              val peripheralData = Arguments.createMap().apply {
                  putString("identifier", device.address)
                  putString("name", deviceName)
                  putInt("rssi", it.rssi)
                  putString("advertisementData", advertisementData)
              }
              sendEvent("onPeripheralFound", peripheralData)
          }
      }

      override fun onBatchScanResults(results: MutableList<ScanResult>?) {
          results?.forEach { result ->
              onScanResult(0, result)
          }
      }

      override fun onScanFailed(errorCode: Int) {
          sendEvent("onError", "Scan failed with error code: $errorCode")
      }
  }

  private fun bytesToHex(bytes: ByteArray): String {
      val sb = StringBuilder()
      for (b in bytes) {
          sb.append(String.format("%02X", b))
      }
      return sb.toString()
  }
  
  companion object {
    const val NAME = "BleScan"
  }
}
