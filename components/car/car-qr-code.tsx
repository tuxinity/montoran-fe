"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Car } from "@/types/car";
import { Download } from "lucide-react";
import { VisuallyHidden } from "@/components/ui/visually-hidden";

interface CarQRCodeProps {
  car: Car;
  isOpen: boolean;
  onClose: () => void;
}

export function CarQRCode({ car, isOpen, onClose }: CarQRCodeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [qrSize, setQrSize] = useState(0);

  // Calculate QR code size based on container size
  const updateQRSize = () => {
    if (!containerRef.current) return;

    // Get the container width
    const containerWidth = containerRef.current.clientWidth;

    // Calculate the QR code size (accounting for padding)
    // Subtract padding (24px on each side = 48px total)
    const newSize = Math.min(containerWidth - 48, 350);

    // Update the size if it's different
    if (newSize !== qrSize && newSize > 0) {
      setQrSize(newSize);
    }
  };

  // Update size on mount and when dialog opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure the dialog is fully rendered
      const timer = setTimeout(() => {
        updateQRSize();
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Update size on window resize
  useEffect(() => {
    const handleResize = () => {
      updateQRSize();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const brandName = car.expand?.model?.expand?.brand?.name || "";
  const modelName = car.expand?.model?.name || "";
  const titleText = `QR Code for ${brandName} ${modelName}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-w-[95vw] p-4">
        <DialogHeader className="p-0 m-0 h-0">
          <VisuallyHidden>
            <DialogTitle>{titleText}</DialogTitle>
          </VisuallyHidden>
        </DialogHeader>

        <div
          ref={containerRef}
          className="flex justify-center items-center p-4 bg-white rounded-md shadow-sm border w-full"
        >
          {qrSize > 0 && (
            <QRCode
              id="car-qr-code"
              value={carUrl}
              size={qrSize}
              level="H"
              className="mx-auto"
            />
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={downloadQRCode} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
