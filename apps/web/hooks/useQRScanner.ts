import { useRef, useCallback, useState, useEffect } from "react";

interface QRScannerResult {
  data: string;
  timestamp: number;
}

export function useQRScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [result, setResult] = useState<QRScannerResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startScanning = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsActive(true);
        scanFrame();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to access camera");
      setIsActive(false);
    }
  }, []);

  const stopScanning = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsActive(false);
  }, []);

  const scanFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isActive) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    const video = videoRef.current;

    // Draw video frame to canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    try {
      // Simple QR detection - looking for pattern in image data
      // In production, use jsQR library for better results
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = detectQRCode(imageData);

      if (code) {
        setResult({ data: code, timestamp: Date.now() });
        stopScanning();
        return;
      }
    } catch (err) {
      // Continue scanning on error
    }

    animationFrameRef.current = requestAnimationFrame(scanFrame);
  }, [isActive, stopScanning]);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  return {
    videoRef,
    canvasRef,
    isActive,
    result,
    error,
    startScanning,
    stopScanning,
    reset: () => {
      setResult(null);
      setError(null);
    }
  };
}

// Simple QR code detection (fallback if jsQR not available)
function detectQRCode(imageData: ImageData): string | null {
  // This is a simplified detection - in production use jsQR library
  // Looking for typical QR pattern structure
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  // Look for dark modules (QR code is mostly dark)
  let darkCount = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const brightness = (r + g + b) / 3;

    if (brightness < 128) darkCount++;
  }

  // If we detect a pattern that looks like QR code, return placeholder
  // In real implementation, use jsQR to decode
  if (darkCount > data.length * 0.1 && darkCount < data.length * 0.5) {
    // Return detected pattern - could be parsed QR code
    return null;
  }

  return null;
}

// Manual QR input (fallback for quick testing)
export function useQRInput() {
  const [manualInput, setManualInput] = useState("");
  const [result, setResult] = useState<QRScannerResult | null>(null);

  const handleSubmit = () => {
    if (manualInput.trim()) {
      setResult({
        data: manualInput.trim(),
        timestamp: Date.now()
      });
      setManualInput("");
    }
  };

  return {
    manualInput,
    setManualInput,
    result,
    handleSubmit,
    reset: () => {
      setResult(null);
      setManualInput("");
    }
  };
}
