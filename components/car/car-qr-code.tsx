"use client";

import { useState } from "react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Car } from "@/types/car";
import { Download } from "lucide-react";

interface CarQRCodeProps {
  car: Car;
  isOpen: boolean;
  onClose: () => void;
}

export function CarQRCode({ car, isOpen, onClose }: CarQRCodeProps) {
  const [qrSize] = useState(500);

  // Generate the URL for the car detail page
  const carUrl = `${window.location.origin}/car/${car.id}`;

  // Function to download QR code as SVG
  const downloadQRCode = () => {
    const svg = document.getElementById("car-qr-code");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);

    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = `car-${car.id}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Car QR Code</DialogTitle>
          <DialogDescription>
            Scan this QR code to view details for{" "}
            {car.expand?.model?.expand?.brand?.name} {car.expand?.model?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center p-4 bg-white rounded-md">
          <QRCode
            id="car-qr-code"
            value={carUrl}
            size={qrSize}
            level="H"
            className="mx-auto"
          />
        </div>

        <DialogFooter className="sm:justify-between">
          <div className="text-sm text-muted-foreground">
            QR code links to: {carUrl}
          </div>
          <Button onClick={downloadQRCode} className="ml-auto">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
