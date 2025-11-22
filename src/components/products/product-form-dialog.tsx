"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
import { productSchema, type ProductFormData } from "@/lib/validations/product";
import type { Product } from "@/types/product";
import type { Category, Warehouse } from "@/types/dashboard";
import { toast } from "sonner";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  product: Product | null;
  categories: Category[];
  warehouses: Warehouse[];
  onSuccess: () => void;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  mode,
  product,
  categories,
  warehouses,
  onSuccess,
}: ProductFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    trigger,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      description: "",
      categoryId: "",
      unitOfMeasure: "",
      stock: 0,
      minStockLevel: undefined,
      warehouseId: "",
    },
  });

  const selectedCategoryId = watch("categoryId");
  const selectedWarehouseId = watch("warehouseId");

  // Populate form when editing
  useEffect(() => {
    if (mode === "edit" && product) {
      reset({
        name: product.name,
        sku: product.sku,
        description: product.description || "",
        categoryId: product.categoryId,
        unitOfMeasure: product.unitOfMeasure,
        stock: product.stock,
        minStockLevel: product.minStockLevel || undefined,
        warehouseId: product.warehouseId,
      });
    } else {
      reset({
        name: "",
        sku: "",
        description: "",
        categoryId: "",
        unitOfMeasure: "",
        stock: 0,
        minStockLevel: undefined,
        warehouseId: "",
      });
    }
  }, [mode, product, reset, open]);

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    setError(null);

    try {
      const url =
        mode === "create" ? "/api/products" : `/api/products/${product?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save product");
      }

      const message = mode === "create" ? "Product created successfully" : "Product updated successfully";
      toast.success(message);
      onSuccess();
      onOpenChange(false);
      reset();
    } catch (err: any) {
      console.error("Error saving product:", err);
      setError(err.message || "Failed to save product");
      toast.error(err.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Product" : "Edit Product"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* SKU */}
            <div className="space-y-2">
              <Label htmlFor="sku">
                SKU <span className="text-destructive">*</span>
              </Label>
              <Input
                id="sku"
                {...register("sku")}
                placeholder="e.g., PROD-001"
                className="uppercase"
              />
              {errors.sku && (
                <p className="text-sm text-destructive">{errors.sku.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Product description (optional)"
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="categoryId">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedCategoryId || ""}
                onValueChange={(value) => {
                  setValue("categoryId", value, { shouldValidate: true });
                  trigger("categoryId");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-sm text-destructive">
                  {errors.categoryId.message}
                </p>
              )}
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
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Unit of Measure */}
            <div className="space-y-2">
              <Label htmlFor="unitOfMeasure">
                Unit <span className="text-destructive">*</span>
              </Label>
              <Input
                id="unitOfMeasure"
                {...register("unitOfMeasure")}
                placeholder="e.g., kg, pcs, liters"
              />
              {errors.unitOfMeasure && (
                <p className="text-sm text-destructive">
                  {errors.unitOfMeasure.message}
                </p>
              )}
            </div>

            {/* Stock */}
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                {...register("stock", { valueAsNumber: true })}
              />
              {errors.stock && (
                <p className="text-sm text-destructive">{errors.stock.message}</p>
              )}
            </div>

            {/* Min Stock Level */}
            <div className="space-y-2">
              <Label htmlFor="minStockLevel">Min Stock Level</Label>
              <Input
                id="minStockLevel"
                type="number"
                {...register("minStockLevel", { valueAsNumber: true })}
                placeholder="Optional"
              />
              {errors.minStockLevel && (
                <p className="text-sm text-destructive">
                  {errors.minStockLevel.message}
                </p>
              )}
            </div>
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
              {loading
                ? mode === "create"
                  ? "Creating..."
                  : "Updating..."
                : mode === "create"
                  ? "Create Product"
                  : "Update Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
