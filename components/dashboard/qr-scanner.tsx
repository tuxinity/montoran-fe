"use client";

import { useState, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QrCode, Camera, StopCircle } from "lucide-react";

interface QRScannerProps {
  onSuccess: (carId: string) => void;
}

export function QRScanner({ onSuccess }: QRScannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerInstance, setScannerInstance] = useState<Html5Qrcode | null>(
    null
  );

  useEffect(() => {
    return () => {
      if (scannerInstance && scannerInstance.isScanning) {
        scannerInstance.stop();
      }
    };
  }, [scannerInstance]);

  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      setScannerInstance(html5QrCode);

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          // Check if the scanned URL contains a car ID
          const urlPattern = /\/car\/([a-zA-Z0-9]+)/;
          const match = decodedText.match(urlPattern);

          if (match && match[1]) {
            const carId = match[1];
            html5QrCode.stop();
            setIsOpen(false);
            setIsScanning(false);
            onSuccess(carId);
          }
        },
        () => {}
      );

      setIsScanning(true);
    } catch (error) {
      console.error("Error starting scanner:", error);
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerInstance && scannerInstance.isScanning) {
      await scannerInstance.stop();
      setIsScanning(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && scannerInstance && scannerInstance.isScanning) {
      stopScanner();
    }
    setIsOpen(open);
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <QrCode className="h-4 w-4" />
        Scan QR Code
      </Button>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan Car QR Code</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center gap-4">
            <div
              id="qr-reader"
              className="w-full max-w-[300px] h-[300px] bg-gray-100 rounded-md overflow-hidden"
            ></div>

            {!isScanning ? (
              <Button onClick={startScanner} className="w-full">
                <Camera className="h-4 w-4 mr-2" />
                Start Camera
              </Button>
            ) : (
              <Button
                onClick={stopScanner}
                variant="destructive"
                className="w-full"
              >
                <StopCircle className="h-4 w-4 mr-2" />
                Stop Scanner
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
