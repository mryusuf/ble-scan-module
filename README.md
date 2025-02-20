# BLE SCAN React Native Module

This is a React Native Module that provides BLE devices scanning functionality on both iOS and Android.
created with [`create-react-native-library`](https://www.npmjs.com/package/create-react-native-library).

## Get started

To Integrate this module to your React Native Project

1. Link the library at module/ble-scan based on your project setup. Copy all the folder (except `example`) to `modules/ble-scan`
 using `link:` protocol when using Yarn and `file:` when using npm
   ```json
   "dependencies": {
      "react-native-ble-scan": "file:./modules/ble-scan"
   }
   ```  
2. Run pod install --project-directory=ios to install dependencies with CocoaPods

3. Setup Required Bluetooth Permissions on iOS. Add `NSBluetoothPeripheralUsageDescription` and optional `NSBluetoothAlwaysUsageDescription` on `ios/your-project/info.plist`

  ```plist
	<key>NSBluetoothPeripheralUsageDescription</key>
	<string>This app requires Bluetooth access to search for BLE devices</string>
	
   <key>NSBluetoothAlwaysUsageDescription</key>
	<string>This app requires Bluetooth access to search for BLE devices</string>
</dict>
  ```

4. Setup required Bluetooth Permissions on Android. Call `requestBluetooth()` on your `onCreate` method in your `MainActivity` Classes. Alternatively, you can request permissions from your React Native code

   ```kotlin
    private val requestEnableBluetooth =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            if (result.resultCode == RESULT_OK) {

            } else {
                // denied
            }
        }

    private val requestMultiplePermissions =
        registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { permissions ->
            permissions.entries.forEach {
                Log.d("MyTag", "${it.key} = ${it.value}")
            }
        }

    private fun requestBluetooth() {
        // check android 12+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            requestMultiplePermissions.launch(
                arrayOf(
                    Manifest.permission.BLUETOOTH_SCAN,
                    Manifest.permission.BLUETOOTH_CONNECT,
                )
            )
        } else {
            val enableBtIntent = Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE)
            requestEnableBluetooth.launch(enableBtIntent)
            val enableCoarseLocationIntent = Intent(android.provider.Settings.ACTION_LOCATION_SOURCE_SETTINGS)
            requestEnableBluetooth.launch(enableCoarseLocationIntent)
        }
    }
   ```

5. Run npx react-native run-android or npx react-native run-ios to build and run the app
6. Import from react-native-ble-scan and use it in your app.
   ```typescript
   import BLEManager, { Peripheral } from 'react-native-ble-scan';
   const scanStartSubscription = BLEManager.onScanStart(() => {});
   ```
7. Example code to access the Peripheral data using `useRef`
   ```typescript
   
      const [peripherals, setPeripherals] = useState<Peripheral[]>([]);
      const peripheralsRef = useRef<Peripheral[]>([]);
      useEffect(() => {
         peripheralsRef.current = peripherals;
      }, [peripherals]);

      const peripheralSubscription = BLEManager.onPeripheralFound((peripheral: Peripheral) => {
         setPeripherals(prev => {
            // Avoid duplicates by checking the identifier.
            if (prev.find(p => p.identifier === peripheral.identifier)) {
            return prev;
            }
            return [...prev, peripheral];
         });
      });
   ```


## Sample project

You can run the sample project on the branch `sample-app` or go to `example` folder

1. Checkout to `sample-app`
   ```bash
   git checkout sample-app
   ```
2. Setup expo project
   ```bash
   npm install
   ```
3. Start the app

   ```bash
    npx expo start
   ```
