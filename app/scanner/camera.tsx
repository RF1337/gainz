// camera.tsx with React Native Vision Camera
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from "react-native-vision-camera";

export default function CameraScreen() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [torch, setTorch] = useState<"off" | "on">("off");
  const [scanned, setScanned] = useState<boolean>(false);
  const [scanSuccess, setScanSuccess] = useState<boolean>(false);
  const scannedRef = useRef(false);
  const router = useRouter();

  // Get camera device
  const device = useCameraDevice(facing);

  // Request permission on mount
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  // Barcode scanner
  const codeScanner = useCodeScanner({
    codeTypes: ["ean-13", "ean-8", "upc-a", "code-128"],
    onCodeScanned: useCallback(
      async (codes) => {
        if (scannedRef.current || codes.length === 0) return;
        
        const code = codes[0];
        if (!code?.value) return;

        scannedRef.current = true;
        setScanned(true);

        try {
          const res = await fetch(
            `https://world.openfoodfacts.org/api/v0/product/${code.value}.json`
          );
          const json = await res.json();

          if (json.status !== 1) {
            // Failed scan / product not found: allow retry
            scannedRef.current = false;
            setScanned(false);
            Alert.alert("Product not found", "Please try scanning again");
            return;
          }

          const product = json.product;

          const { data: existing } = await supabase
            .from('foods')
            .select('id')
            .eq('barcode', code.value)
            .maybeSingle();
          
          // Indicate success visually
          setScanSuccess(true);
          // Brief delay so user sees green border
          await new Promise((r) => setTimeout(r, 500));

          router.push({
            pathname: `/scanner/details/${code.value}`,
            params: {
              product: JSON.stringify(product) // optional
            }
          });

        } catch (error) {
          console.error("Scan error:", error);
          // Revert so user can retry
          scannedRef.current = false;
          setScanned(false);
          Alert.alert("Error", "Failed to scan barcode. Please try again.");
        }
      },
      [router]
    ),
  });

  const toggleCameraType = useCallback(() => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }, []);

  const toggleTorch = useCallback(() => {
    setTorch((current) => (current === "off" ? "on" : "off"));
  }, []);

  const resetScan = useCallback(() => {
    scannedRef.current = false;
    setScanned(false);
    setScanSuccess(false);
  }, []);

  // Handle permission states
  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.message}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.message}>Camera permission denied</Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.message}>No camera device found</Text>
      </View>
    );
  }

  const { width, height } = Dimensions.get("window");
  const overlaySize = width * 0.7;
  const overlayBorder = (width - overlaySize) / 2;
  const verticalMaskHeight = (height - overlaySize) / 2;

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFillObject}
        device={device}
        isActive={true}
        codeScanner={scanned ? undefined : codeScanner}
        torch={torch}
        enableZoomGesture={true}
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
                borderColor: scanSuccess ? "#00FF00" : "white",
              },
            ]}
          />
          <View style={[styles.mask, { width: overlayBorder, height: overlaySize }]} />
        </View>
        <View style={[styles.mask, { height: verticalMaskHeight, width }]} />
      </View>

      {/* Scan instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          {scanned 
            ? scanSuccess 
              ? "✓ Product found!" 
              : "Processing..."
            : "Point camera at barcode"
          }
        </Text>
      </View>

      {/* Controls */}
      <TouchableOpacity onPress={toggleTorch} style={styles.flashButton}>
        <Ionicons 
          name={torch === "on" ? "flash" : "flash-off"} 
          size={32} 
          color="white" 
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={toggleCameraType} style={styles.cameraButton}>
        <Ionicons name="camera-reverse" size={32} color="white" />
      </TouchableOpacity>

      <TouchableOpacity onPress={router.back} style={styles.exitButton}>
        <Ionicons name="close" size={32} color="white" />
      </TouchableOpacity>

      {/* Reset button when scan is completed */}
      {scanned && !scanSuccess && (
        <TouchableOpacity onPress={resetScan} style={styles.resetButton}>
          <Text style={styles.resetButtonText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: "black",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
    padding: 20,
  },
  message: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  mask: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  centerBorder: {
    borderWidth: 4,
    borderRadius: 20,
    backgroundColor: "transparent",
  },
  instructionsContainer: {
    position: "absolute",
    bottom: 150,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  instructionsText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: "hidden",
  },
  cameraButton: {
    position: "absolute",
    bottom: 50,
    right: 30,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 12,
    borderRadius: 25,
  },
  flashButton: {
    position: "absolute",
    bottom: 50,
    left: 30,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 12,
    borderRadius: 25,
  },
  exitButton: {
    position: "absolute",
    top: 60,
    left: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 12,
    borderRadius: 25,
  },
  resetButton: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  resetButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});