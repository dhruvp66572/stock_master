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
import { Plus, X, AlertTriangle, ArrowRight } from "lucide-react";
import { transferSchema, type TransferFormData } from "@/lib/validations/transfer";
import type { Warehouse } from "@/types/dashboard";
import type { Product } from "@/types/product";

interface TransferFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouses: Warehouse[];
  onSuccess: () => void;
}

export function TransferFormDialog({
  open,
  onOpenChange,
  warehouses,
  onSuccess,
}: TransferFormDialogProps) {
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
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      fromWarehouseId: "",
      toWarehouseId: "",
      notes: null,
      items: [{ productId: "", quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const selectedFromWarehouseId = watch("fromWarehouseId");
  const selectedToWarehouseId = watch("toWarehouseId");
  const items = watch("items");

  // Fetch products when source warehouse is selected
  useEffect(() => {
    if (selectedFromWarehouseId && selectedFromWarehouseId !== "") {
      fetchProducts(selectedFromWarehouseId);
    } else {
      setProducts([]);
    }
  }, [selectedFromWarehouseId]);

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

  const onSubmit = async (data: TransferFormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create transfer");
      }

      onSuccess();
      onOpenChange(false);
      reset();
    } catch (err: any) {
      console.error("Error creating transfer:", err);
      setError(err.message || "Failed to create transfer");
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
          <DialogTitle>Create Internal Transfer</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Warehouses */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* From Warehouse */}
            <div className="space-y-2">
              <Label htmlFor="fromWarehouseId">
                From Warehouse <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedFromWarehouseId || ""}
                onValueChange={(value) => {
                  setValue("fromWarehouseId", value, { shouldValidate: true });
                  trigger("fromWarehouseId");
                  // Clear items when changing source warehouse
                  setValue("items", [{ productId: "", quantity: 1 }]);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((warehouse) => (
                    <SelectItem 
                      key={warehouse.id} 
                      value={warehouse.id}
                      disabled={warehouse.id === selectedToWarehouseId}
                    >
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.fromWarehouseId && (
                <p className="text-sm text-destructive">
                  {errors.fromWarehouseId.message}
                </p>
              )}
            </div>

            {/* To Warehouse */}
            <div className="space-y-2">
              <Label htmlFor="toWarehouseId">
                To Warehouse <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={selectedToWarehouseId || ""}
                  onValueChange={(value) => {
                    setValue("toWarehouseId", value, { shouldValidate: true });
                    trigger("toWarehouseId");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((warehouse) => (
                      <SelectItem 
                        key={warehouse.id} 
                        value={warehouse.id}
                        disabled={warehouse.id === selectedFromWarehouseId}
                      >
                        {warehouse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {errors.toWarehouseId && (
                <p className="text-sm text-destructive">
                  {errors.toWarehouseId.message}
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Transfer notes (optional)"
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
                disabled={!selectedFromWarehouseId || loadingProducts}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>

            {!selectedFromWarehouseId && (
              <p className="text-sm text-muted-foreground">
                Please select source warehouse first
              </p>
            )}

            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id}>
                  <div className="flex gap-2 items-start">
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
                        disabled={loadingProducts || !selectedFromWarehouseId}
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
                  </div>

                  {/* Stock Warning */}
                  {items[index]?.productId &&
                    hasStockWarning(
                      items[index].productId,
                      items[index].quantity || 0
                    ) && (
                      <div className="mt-1 flex items-center gap-2 text-sm text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        Only {getProductStock(items[index].productId)} units available
                      </div>
                    )}
                </div>
              ))}
            </div>

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
              {loading ? "Creating..." : "Create Transfer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
