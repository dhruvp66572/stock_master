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
import { AlertTriangle, ArrowRight } from "lucide-react";
import type { Transfer } from "@/types/transfer";

interface CancelTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transfer: Transfer | null;
  onSuccess: () => void;
}

export function CancelTransferDialog({
  open,
  onOpenChange,
  transfer,
  onSuccess,
}: CancelTransferDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    if (!transfer) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/transfers/${transfer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELED" }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to cancel transfer");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Error canceling transfer:", err);
      setError(err.message || "Failed to cancel transfer");
    } finally {
      setLoading(false);
    }
  };

  if (!transfer) return null;

  const canCancel = transfer.status === "DRAFT" || transfer.status === "IN_TRANSIT";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Cancel Transfer #{transfer.transferNumber}
          </DialogTitle>
          <DialogDescription className="space-y-3">
            <p>
              Are you sure you want to cancel this transfer? This action cannot be
              undone.
            </p>
            <div className="rounded-lg bg-muted p-3 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{transfer.fromWarehouse.name}</span>
                <ArrowRight className="h-4 w-4" />
                <span className="font-semibold">{transfer.toWarehouse.name}</span>
              </div>
              <p>
                <span className="font-semibold">Items:</span> {transfer.items.length}{" "}
                product(s)
              </p>
              <p>
                <span className="font-semibold">Status:</span> {transfer.status}
              </p>
            </div>
            {!canCancel && (
              <p className="text-destructive font-semibold">
                This transfer cannot be canceled because it is already{" "}
                {transfer.status}.
              </p>
            )}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Back
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={loading || !canCancel}
          >
            {loading ? "Canceling..." : "Cancel Transfer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
