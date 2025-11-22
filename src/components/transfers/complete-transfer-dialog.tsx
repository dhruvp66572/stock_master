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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, AlertTriangle } from "lucide-react";
import type { Transfer } from "@/types/transfer";

interface CompleteTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transfer: Transfer | null;
  onSuccess: () => void;
}

export function CompleteTransferDialog({
  open,
  onOpenChange,
  transfer,
  onSuccess,
}: CompleteTransferDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async () => {
    if (!transfer) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/transfers/${transfer.id}/complete`, {
        method: "PUT",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to complete transfer");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Error completing transfer:", err);
      setError(err.message || "Failed to complete transfer");
    } finally {
      setLoading(false);
    }
  };

  if (!transfer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Complete Transfer #{transfer.transferNumber}
          </DialogTitle>
          <DialogDescription>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                This will move stock from source to destination warehouse
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold">{transfer.fromWarehouse.name}</span>
                <ArrowRight className="h-4 w-4" />
                <span className="font-semibold">{transfer.toWarehouse.name}</span>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        {/* Items Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Current Stock</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfer.items.map((item) => {
                const hasStock = item.product.stock >= item.quantity;
                
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.product.sku}
                    </TableCell>
                    <TableCell>{item.product.name}</TableCell>
                    <TableCell className="text-right">
                      {item.quantity} {item.product.unitOfMeasure}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.product.stock}
                    </TableCell>
                    <TableCell>
                      {hasStock ? (
                        <Badge variant="default" className="bg-green-100 text-green-700">
                          Available
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Insufficient Stock</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
          <p className="font-semibold">What happens next:</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>Stock will be decreased from {transfer.fromWarehouse.name}</li>
            <li>Stock will be increased in {transfer.toWarehouse.name}</li>
            <li>Stock movements will be logged for audit trail</li>
            <li>Transfer status will be marked as COMPLETED</li>
          </ul>
        </div>

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
            Cancel
          </Button>
          <Button onClick={handleComplete} disabled={loading}>
            {loading ? "Completing..." : "Complete Transfer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
