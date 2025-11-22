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
import { AlertTriangle } from "lucide-react";
import type { Delivery } from "@/types/delivery";

interface CancelDeliveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  delivery: Delivery | null;
  onSuccess: () => void;
}

export function CancelDeliveryDialog({
  open,
  onOpenChange,
  delivery,
  onSuccess,
}: CancelDeliveryDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    if (!delivery) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/deliveries/${delivery.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELED" }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to cancel delivery");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Error canceling delivery:", err);
      setError(err.message || "Failed to cancel delivery");
    } finally {
      setLoading(false);
    }
  };

  if (!delivery) return null;

  const canCancel = delivery.status === "DRAFT" || delivery.status === "READY";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Cancel Delivery #{delivery.deliveryNumber}
          </DialogTitle>
          <DialogDescription className="space-y-3">
            <p>
              Are you sure you want to cancel this delivery? This action cannot be
              undone.
            </p>
            <div className="rounded-lg bg-muted p-3 space-y-1 text-sm">
              <p>
                <span className="font-semibold">Customer:</span>{" "}
                {delivery.customerName}
              </p>
              <p>
                <span className="font-semibold">Warehouse:</span>{" "}
                {delivery.warehouse.name}
              </p>
              <p>
                <span className="font-semibold">Items:</span> {delivery.items.length}{" "}
                product(s)
              </p>
            </div>
            {!canCancel && (
              <p className="text-destructive font-semibold">
                This delivery cannot be canceled because it is already{" "}
                {delivery.status}.
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
            {loading ? "Canceling..." : "Cancel Delivery"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
