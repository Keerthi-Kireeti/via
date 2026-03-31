"use client";

import { QRCodeSVG } from 'qrcode.react';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  className?: string;
}

export function QRCodeGenerator({ value, size = 128, className }: QRCodeGeneratorProps) {
  return (
    <div className={`bg-white p-2 rounded-xl inline-block shadow-lg ${className}`}>
      <QRCodeSVG 
        value={value} 
        size={size}
        level="H"
        includeMargin={false}
        className="mx-auto"
      />
    </div>
  );
}
