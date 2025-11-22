"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import {
  createReceiptSchema,
  type CreateReceiptData,
} from "@/lib/validations/receipt";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export default function CreateReceiptDialog({
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateReceiptData>({
    resolver: zodResolver(createReceiptSchema),
    defaultValues: {
      supplierName: "",
      warehouseId: "",
      notes: "",
      items: [{ productId: "", quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const watchedWarehouse = watch("warehouseId");

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await fetch("/api/dashboard/filters");
        if (!res.ok) throw new Error("Failed to fetch filters");
        const data = await res.json();
        setWarehouses(data.warehouses || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchFilters();
  }, []);

  // Fetch current user name to display in the form (disabled)
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (!res.ok) return;
        const data = await res.json();
        setCurrentUserName(data?.user?.name || null);
      } catch (err) {
        console.error("Failed to fetch session:", err);
      }
    };

    if (open) fetchSession();
  }, [open]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        const params = new URLSearchParams();
        if (watchedWarehouse) params.append("warehouseId", watchedWarehouse);
        const res = await fetch(`/api/products?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        console.log("Fetched products:", data);
        setProducts(data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingProducts(false);
      }
    };

    // fetch when warehouse changes or on open
    if (open) fetchProducts();
  }, [watchedWarehouse, open]);

  const onSubmit = async (values: CreateReceiptData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Failed to create receipt");
      }

      onSuccess();
      reset();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Create receipt error:", err);
      setError(err?.message || "Failed to create receipt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Receipt</DialogTitle>
          <DialogDescription>
            Enter receipt details and add products.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Supplier Name</Label>
            <Input {...register("supplierName")} />
            {errors.supplierName && (
              <p className="text-sm text-destructive">
                {errors.supplierName.message}
              </p>
            )}
          </div>

          <div>
            <Label>Responsible</Label>
            <Input value={currentUserName ?? ""} disabled />
          </div>

          <div>
            <Label>Warehouse</Label>
            <Controller
              control={control}
              name="warehouseId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w: any) => (
                      <SelectItem key={w.id} value={String(w.id)}>
                        {w.name} - {w.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />

            {errors.warehouseId && (
              <p className="text-sm text-destructive">
                {errors.warehouseId.message}
              </p>
            )}
          </div>

          <div>
            <Label>Products</Label>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <Controller
                    control={control}
                    name={`items.${index}.productId`}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-64">
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((p: any) => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              {p.name} - {p.sku} - {p.unitOfMeasure}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />

                  <Input
                    type="number"
                    {...register(`items.${index}.quantity` as const, {
                      valueAsNumber: true,
                    })}
                    className="w-24"
                    min={1}
                  />

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={fields.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => append({ productId: "", quantity: 1 })}
              >
                <Plus className="mr-2 h-4 w-4" /> Add product
              </Button>
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea {...register("notes")} />
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Receipt"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
