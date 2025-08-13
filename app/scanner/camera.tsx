// camera.tsx (formerly scanner.tsx)
import { Ionicons } from "@expo/vector-icons";
import { Camera, CameraType, CameraView, PermissionStatus } from "expo-camera";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CameraScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [torch, setTorch] = useState<boolean>(false);
  const [scanned, setScanned] = useState<boolean>(false);
  const [scanSuccess, setScanSuccess] = useState<boolean>(false);
  const scannedRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { status }: { status: PermissionStatus } =
        await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === PermissionStatus.GRANTED);
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scannedRef.current) return;
    scannedRef.current = true;
    setScanned(true);

    try {
      const res = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${data}.json`
      );
      const json = await res.json();

      if (json.status !== 1) {
        // failed scan / product not found: allow retry
        scannedRef.current = false;
        setScanned(false);
        return;
      }

      const product = json.product;

      // indicate success visually
      setScanSuccess(true);
      // brief delay so user sees green border
      await new Promise((r) => setTimeout(r, 300));

      router.push({
        pathname: "/scanner/details",
        params: {
          product: JSON.stringify(product),
          barcode: data,
        },
      });
    } catch (error) {
      console.error("Scan error:", error);
      // revert so user can retry
      scannedRef.current = false;
      setScanned(false);
    }
  };

  const toggleCameraType = () =>
    setFacing((current) => (current === "back" ? "front" : "back"));

  const toggleTorch = () => setTorch((current) => !current);

  const { width, height } = Dimensions.get("window");
  const overlaySize = width * 0.7;
  const overlayBorder = (width - overlaySize) / 2;
  const verticalMaskHeight = (height - overlaySize) / 2;

  if (hasPermission === null) {
    return <Text style={styles.message}>Requesting camera permission...</Text>;
  }
  if (hasPermission === false) {
    return <Text style={styles.message}>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8"] }}
        style={StyleSheet.absoluteFillObject}
        facing={facing}
        enableTorch={torch}
      />

      {/* Overlay */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <View style={[styles.mask, { height: verticalMaskHeight, width }]} />
        <View style={{ flexDirection: "row" }}>
          <View style={[styles.mask, { width: overlayBorder, height: overlaySize }]} />
          <View
            style={[
              styles.centerBorder,
              {
                width: overlaySize,
                height: overlaySize,
                borderColor: scanSuccess ? "lime" : "white",
              },
            ]}
          />
          <View style={[styles.mask, { width: overlayBorder, height: overlaySize }]} />
        </View>
        <View style={[styles.mask, { height: verticalMaskHeight, width }]} />
      </View>

      {/* Controls */}
      <TouchableOpacity onPress={toggleTorch} style={styles.flashButton}>
        <Ionicons name={torch ? "flash" : "flash-off"} size={32} color="white" />
      </TouchableOpacity>
      <TouchableOpacity onPress={toggleCameraType} style={styles.cameraButton}>
        <Ionicons name="camera-reverse" size={32} color="white" />
      </TouchableOpacity>
      <TouchableOpacity onPress={router.back} style={styles.exitButton}>
        <Ionicons name="close" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  message: {
    flex: 1,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 18,
  },
  mask: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  centerBorder: {
    borderWidth: 5,
    borderRadius: 25,
    // borderColor is set dynamically based on scanSuccess
  },
  cameraButton: {
    position: "absolute",
    bottom: 50,
    right: 30,
  },
  flashButton: {
    position: "absolute",
    bottom: 50,
    left: 30,
  },
  exitButton: {
    position: "absolute",
    top: 50,
    left: 15,
  },
});