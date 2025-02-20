import { Image, StyleSheet, Platform, Button, FlatList, ActivityIndicator } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useEffect, useRef, useState } from 'react';
import BLEManager, { Peripheral } from 'react-native-ble-scan';

export default function HomeScreen() {
  const [peripherals, setPeripherals] = useState<Peripheral[]>([]);
  const [scanning, setScanning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const peripheralsRef = useRef<Peripheral[]>([]);
  
  useEffect(() => {
    peripheralsRef.current = peripherals;
  }, [peripherals]);

  useEffect(() => {
    const scanStartSubscription = BLEManager.onScanStart(() => {
      setScanning(true);
      setError(null);
      setPeripherals([]);
    });

    const scanEndSubscription = BLEManager.onScanEnd(() => {
      setScanning(false);
      console.log('Peripherals found: ', peripheralsRef.current.length);
    });

    const scanUnsupportedSubscription = BLEManager.onScanUnsupported(() => {
      setScanning(false);
      setError("Sorry, BLE Scan is not supported on your device");
    });

    const scanUnauthorizedSubscription = BLEManager.onScanUnauthorized(() => {
      setScanning(false);
      setError("BLE Scan is not authorized, please try again");
    });

    const peripheralSubscription = BLEManager.onPeripheralFound((peripheral: Peripheral) => {
      setPeripherals(prev => {
        // Avoid duplicates by checking the identifier.
        if (prev.find(p => p.identifier === peripheral.identifier)) {
          return prev;
        }
        return [...prev, peripheral];
      });
    });

    return () => {
      // Clean up subscriptions on unmount.
      scanStartSubscription.remove();
      scanEndSubscription.remove();
      scanUnsupportedSubscription.remove();
      scanUnauthorizedSubscription.remove();
      peripheralSubscription.remove();
    };
  })

  const handleScan = () => {
    setError(null);
    setPeripherals([]);
    try {
      BLEManager.startScanning();

      // Stop Scanning after 10s
      setTimeout(() => {
        BLEManager.stopScanning();
      }, 10000);
    } catch (err: any) {
      setError(err.message || 'Error starting scan.');
      setScanning(false);
    }
  };

  const renderItem = ({ item }: { item: Peripheral }) => (
    <ThemedView style={styles.item} key={item.identifier}>
      <ThemedText style={styles.identifier}>ID: {item.identifier}</ThemedText>
      <ThemedText>Name: {item.name}</ThemedText>
      <ThemedText>RSSI: {item.rssi}</ThemedText>
      <ThemedText>Advertisement Data: {JSON.stringify(item.advertisementData)}</ThemedText>
    </ThemedView>
  );
  
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText>
          Click on button below to start scanning nearby BLE devices
        </ThemedText>
      </ThemedView>
      <Button title="Scan BLE Devices" onPress={handleScan} disabled={scanning || error != null}></Button>

      {scanning && (
        <ThemedView style={styles.scanningContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <ThemedText style={styles.scanningText}>Scanning for devices...</ThemedText>
        </ThemedView>
      )}

      {error && <ThemedText style={styles.error}>{error}</ThemedText>}

      {!scanning && peripherals.length === 0 && !error && (
        <ThemedText style={styles.empty}>No BLE devices found.</ThemedText>
      )}

      {peripherals.length > 0 && (
        peripherals.map((item) => renderItem({item: item}))
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  container: {
    flex: 1,
    padding: 16,
    marginTop: 40,
  },
  scanningContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
  scanningText: {
    marginTop: 8,
    fontSize: 16,
  },
  listContainer: {
    marginTop: 16,
  },
  item: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
  },
  identifier: {
    fontWeight: 'bold',
  },
  empty: {
    marginTop: 16,
    textAlign: 'center',
    color: '#666',
  },
  error: {
    marginTop: 16,
    color: 'red',
    textAlign: 'center',
  },
});
