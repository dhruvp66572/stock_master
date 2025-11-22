import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
  sku: z
    .string()
    .min(2, "SKU must be at least 2 characters")
    .max(50, "SKU must not exceed 50 characters")
    .regex(/^[A-Z0-9-]+$/, "SKU must be uppercase alphanumeric with hyphens")
    .transform((val) => val.toUpperCase()),
  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .optional(),
  categoryId: z.string().cuid("Invalid category ID"),
  unitOfMeasure: z
    .string()
    .min(1, "Unit of measure is required")
    .max(20, "Unit of measure must not exceed 20 characters"),
  stock: z
    .number()
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative")
    .optional(),
  minStockLevel: z
    .number()
    .int("Minimum stock level must be a whole number")
    .min(0, "Minimum stock level cannot be negative")
    .optional()
    .nullable(),
  warehouseId: z.string().cuid("Invalid warehouse ID"),
});

export const productUpdateSchema = productSchema.extend({
  id: z.string().cuid("Invalid product ID"),
});

export type ProductFormData = z.infer<typeof productSchema>;
export type ProductUpdateFormData = z.infer<typeof productUpdateSchema>;
