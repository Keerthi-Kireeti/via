"use client";

import { useQRScanner, useQRInput } from "../hooks/useQRScanner";
import { Button } from "@transitlink/ui";
import { useState } from "react";

export function QRDisplay({ data, size = 200 }: { data: string; size?: number }) {
  const [showCode, setShowCode] = useState(true);

  if (!showCode) {
    return (
      <div className="text-center">
        <p className="text-sm text-slate-400 mb-2">QR Code hidden</p>
        <Button variant="secondary" size="sm" onClick={() => setShowCode(true)}>
          Show QR Code
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="bg-white p-2 rounded-lg">
        {/* In production, use qrcode.react or similar */}
        <div
          className="bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center"
          style={{ width: `${size}px`, height: `${size}px` }}
        >
          <div className="text-center text-white text-xs font-mono break-all px-2">
            <p className="font-bold mb-1">QR CODE</p>
            <p>{data.slice(0, 20)}</p>
            {data.length > 20 && <p>...</p>}
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-400">
        Token: {data.slice(-8)}
      </p>
      <Button variant="secondary" size="sm" onClick={() => setShowCode(false)}>
        Hide QR Code
      </Button>
    </div>
  );
}

export function QRScanner({ onScan }: { onScan: (data: string) => void }) {
  const [useManual, setUseManual] = useState(false);
  const scanner = useQRScanner();
  const input = useQRInput();

  const handleScanResult = (data: string) => {
    onScan(data);
    scanner.reset();
  };

  const handleManualSubmit = () => {
    handleScanResult(input.result?.data || "");
    input.reset();
    setUseManual(false);
  };

  if (useManual) {
    return (
      <div className="space-y-4 p-4 bg-slate-900/50 rounded-2xl border border-white/10">
        <h3 className="font-semibold text-white">Manual QR Input</h3>
        <input
          type="text"
          placeholder="Paste or enter QR token..."
          value={input.manualInput}
          onChange={(e) => input.setManualInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleManualSubmit();
          }}
          className="w-full px-4 py-2 rounded-lg border border-white/10 bg-slate-800 text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
        />
        <div className="flex gap-2">
          <Button variant="primary" onClick={handleManualSubmit} className="flex-1">
            Submit
          </Button>
          <Button variant="secondary" onClick={() => setUseManual(false)} className="flex-1">
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (scanner.isActive) {
    return (
      <div className="space-y-3">
        <div className="relative overflow-hidden rounded-2xl border-2 border-cyan-500/50">
          <video
            ref={scanner.videoRef}
            className="w-full h-64 object-cover bg-black"
            playsInline
          />
          <div className="absolute inset-0 border-2 border-cyan-400/50 pointer-events-none">
            <div className="absolute inset-6 border border-cyan-300/30"></div>
          </div>
        </div>
        <canvas ref={scanner.canvasRef} className="hidden" />
        <p className="text-center text-sm text-slate-400">
          Point camera at QR code...
        </p>
        <Button variant="secondary" onClick={() => scanner.stopScanning()} className="w-full">
          Cancel Scan
        </Button>
        <Button variant="secondary" onClick={() => setUseManual(true)} size="sm" className="w-full">
          Enter manually instead
        </Button>
      </div>
    );
  }

  if (scanner.result) {
    return (
      <div className="space-y-3 p-4 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl">
        <p className="text-emerald-200 font-semibold">✓ QR Code Detected!</p>
        <p className="text-sm text-emerald-100 break-all font-mono">{scanner.result.data}</p>
        <div className="flex gap-2">
          <Button
            variant="primary"
            onClick={() => handleScanResult(scanner.result!.data)}
            className="flex-1"
          >
            Confirm
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              scanner.reset();
              scanner.startScanning();
            }}
            className="flex-1"
          >
            Scan Again
          </Button>
        </div>
      </div>
    );
  }

  if (scanner.error) {
    return (
      <div className="space-y-3 p-4 bg-rose-500/20 border border-rose-400/30 rounded-2xl">
        <p className="text-rose-200 font-semibold">⚠ Camera Error</p>
        <p className="text-sm text-rose-100">{scanner.error}</p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setUseManual(true)}
            className="flex-1"
          >
            Use Manual Input
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              scanner.reset();
              scanner.startScanning();
            }}
            className="flex-1"
          >
            Retry Camera
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Button
        variant="primary"
        onClick={() => scanner.startScanning()}
        className="w-full"
      >
        📷 Start Camera Scan
      </Button>
      <Button
        variant="secondary"
        onClick={() => setUseManual(true)}
        size="sm"
        className="w-full"
      >
        Type Code Manually
      </Button>
    </div>
  );
}
