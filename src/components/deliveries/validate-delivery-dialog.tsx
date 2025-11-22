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
import { AlertTriangle, CheckCircle } from "lucide-react";
import type { Delivery } from "@/types/delivery";

interface ValidateDeliveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  delivery: Delivery | null;
  onSuccess: () => void;
}

export function ValidateDeliveryDialog({
  open,
  onOpenChange,
  delivery,
  onSuccess,
}: ValidateDeliveryDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleValidate = async () => {
    if (!delivery) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/deliveries/${delivery.id}/validate`, {
        method: "PUT",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to validate delivery");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Error validating delivery:", err);
      setError(err.message || "Failed to validate delivery");
    } finally {
      setLoading(false);
    }
  };

  if (!delivery) return null;

  const getStockStatusColor = (newStock: number, minStockLevel: number | null) => {
    if (newStock === 0) return "text-destructive";
    if (minStockLevel !== null && newStock <= minStockLevel) return "text-amber-600";
    return "text-green-600";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Validate Delivery #{delivery.deliveryNumber}
          </DialogTitle>
          <DialogDescription>
            <div className="space-y-1">
              <p className="font-semibold text-amber-600 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                This will decrease stock for the following products:
              </p>
              <p className="text-sm">Customer: {delivery.customerName}</p>
              <p className="text-sm">Warehouse: {delivery.warehouse.name}</p>
            </div>
          </DialogDescription>
        </DialogHeader>

        {/* Stock Changes Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Current Stock</TableHead>
                <TableHead className="text-right">New Stock</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {delivery.items.map((item) => {
                const newStock = item.product.stock - item.quantity;
                const minStock = null; // We don't have minStockLevel in the current data structure
                const statusColor = getStockStatusColor(newStock, minStock);

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
                    <TableCell className={`text-right font-bold ${statusColor}`}>
                      {newStock}
                    </TableCell>
                    <TableCell>
                      {newStock === 0 ? (
                        <Badge variant="destructive">Out of Stock</Badge>
                      ) : newStock < 10 ? (
                        <Badge variant="secondary">Low Stock</Badge>
                      ) : (
                        <Badge variant="default">OK</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
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
          <Button onClick={handleValidate} disabled={loading}>
            {loading ? "Validating..." : "Validate Delivery"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
