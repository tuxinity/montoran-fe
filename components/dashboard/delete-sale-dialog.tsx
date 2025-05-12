"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";

interface DeleteSaleDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (notes: string) => void;
  saleId: string;
}

export function DeleteSaleDialog({
  open,
  onClose,
  onConfirm,
}: DeleteSaleDialogProps) {
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (!notes.trim()) {
      setError("Please provide a reason for deletion");
      return;
    }
    onConfirm(notes);
    setNotes("");
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Delete Sale
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this sale? This action cannot be
            undone. Please provide a reason for deletion.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder="Enter reason for deletion..."
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              if (error) setError("");
            }}
            className="min-h-[100px]"
          />
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
