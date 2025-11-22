"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, X, AlertTriangle } from "lucide-react";
import { deliverySchema, type DeliveryFormData } from "@/lib/validations/delivery";
import type { Warehouse } from "@/types/dashboard";
import type { Product } from "@/types/product";

interface DeliveryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouses: Warehouse[];
  onSuccess: () => void;
}

export function DeliveryFormDialog({
  open,
  onOpenChange,
  warehouses,
  onSuccess,
}: DeliveryFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    control,
    trigger,
  } = useForm<DeliveryFormData>({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      customerName: "",
      customerId: null,
      warehouseId: "",
      notes: null,
      items: [{ productId: "", quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const selectedWarehouseId = watch("warehouseId");
  const items = watch("items");

  // Fetch products when warehouse is selected
  useEffect(() => {
    if (selectedWarehouseId && selectedWarehouseId !== "") {
      fetchProducts(selectedWarehouseId);
    } else {
      setProducts([]);
    }
  }, [selectedWarehouseId]);

  const fetchProducts = async (warehouseId: string) => {
    setLoadingProducts(true);
    try {
      const response = await fetch(`/api/products?warehouseId=${warehouseId}`);
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const getProductStock = (productId: string): number => {
    const product = products.find((p) => p.id === productId);
    return product?.stock || 0;
  };

  const hasStockWarning = (productId: string, quantity: number): boolean => {
    const stock = getProductStock(productId);
    return quantity > stock;
  };

  const onSubmit = async (data: DeliveryFormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/deliveries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create delivery");
      }

      onSuccess();
      onOpenChange(false);
      reset();
    } catch (err: any) {
      console.error("Error creating delivery:", err);
      setError(err.message || "Failed to create delivery");
    } finally {
      setLoading(false);
    }
  };

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      reset();
      setError(null);
      setProducts([]);
    }
  }, [open, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Delivery</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Customer Name */}
            <div className="space-y-2">
              <Label htmlFor="customerName">
                Customer Name <span className="text-destructive">*</span>
              </Label>
              <Input id="customerName" {...register("customerName")} />
              {errors.customerName && (
                <p className="text-sm text-destructive">
                  {errors.customerName.message}
                </p>
              )}
            </div>

            {/* Customer ID */}
            <div className="space-y-2">
              <Label htmlFor="customerId">Customer ID</Label>
              <Input id="customerId" {...register("customerId")} placeholder="Optional" />
              {errors.customerId && (
                <p className="text-sm text-destructive">
                  {errors.customerId.message}
                </p>
              )}
            </div>
          </div>

          {/* Warehouse */}
          <div className="space-y-2">
            <Label htmlFor="warehouseId">
              Warehouse <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedWarehouseId || ""}
              onValueChange={(value) => {
                setValue("warehouseId", value, { shouldValidate: true });
                trigger("warehouseId");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select warehouse" />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map((warehouse) => (
                  <SelectItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name} - {warehouse.location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.warehouseId && (
              <p className="text-sm text-destructive">
                {errors.warehouseId.message}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Additional notes (optional)"
            />
            {errors.notes && (
              <p className="text-sm text-destructive">{errors.notes.message}</p>
            )}
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>
                Items <span className="text-destructive">*</span>
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ productId: "", quantity: 1 })}
                disabled={!selectedWarehouseId || loadingProducts}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>

            {!selectedWarehouseId && (
              <p className="text-sm text-muted-foreground">
                Please select a warehouse first
              </p>
            )}

            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start">
                {/* Product Select */}
                <div className="flex-1 space-y-2">
                  <Select
                    value={items[index]?.productId || ""}
                    onValueChange={(value) => {
                      setValue(`items.${index}.productId`, value, {
                        shouldValidate: true,
                      });
                      trigger(`items.${index}.productId`);
                    }}
                    disabled={loadingProducts || !selectedWarehouseId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({product.sku}) - Stock: {product.stock}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.items?.[index]?.productId && (
                    <p className="text-sm text-destructive">
                      {errors.items[index]?.productId?.message}
                    </p>
                  )}
                </div>

                {/* Quantity Input */}
                <div className="w-24 space-y-2">
                  <Input
                    type="number"
                    min="1"
                    {...register(`items.${index}.quantity`, {
                      valueAsNumber: true,
                    })}
                    placeholder="Qty"
                  />
                  {errors.items?.[index]?.quantity && (
                    <p className="text-sm text-destructive">
                      {errors.items[index]?.quantity?.message}
                    </p>
                  )}
                </div>

                {/* Remove Button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* Stock Warning */}
                {items[index]?.productId &&
                  hasStockWarning(
                    items[index].productId,
                    items[index].quantity || 0
                  ) && (
                    <div className="w-full col-span-3 flex items-center gap-2 text-sm text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      Only {getProductStock(items[index].productId)} units available
                    </div>
                  )}
              </div>
            ))}

            {errors.items && typeof errors.items.message === "string" && (
              <p className="text-sm text-destructive">{errors.items.message}</p>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Delivery"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
