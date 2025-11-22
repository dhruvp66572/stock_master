import { z } from "zod";

/**
 * Schema to validate receipt creation payload
 */
export const createReceiptSchema = z.object({
  supplierName: z
    .string()
    .min(2, "Supplier name must be at least 2 characters"),
  warehouseId: z.string().cuid("Invalid warehouse id"),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().cuid("Invalid product id"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
      })
    )
    .min(1, "At least one item is required"),
});

/**
 * Schema to validate query params for listing receipts
 */
export const getReceiptsQuerySchema = z.object({
  status: z
    .union([
      z.literal("DRAFT"),
      z.literal("READY"),
      z.literal("DONE"),
      z.literal("CANCELED"),
    ])
    .optional(),
  warehouseId: z.string().optional(),
  page: z.preprocess((val) => {
    if (typeof val === "string") return Number(val);
    return val;
  }, z.number().int().min(1).default(1)),
  limit: z.preprocess((val) => {
    if (typeof val === "string") return Number(val);
    return val;
  }, z.number().int().min(1).max(100).default(20)),
});

/**
 * Schema for validating receipt validation payload (currently empty)
 */
export const validateReceiptSchema = z.object({}).optional();

// Export types
export type CreateReceiptData = z.infer<typeof createReceiptSchema>;
export type GetReceiptsQuery = z.infer<typeof getReceiptsQuerySchema>;
export type ValidateReceiptData = z.infer<typeof validateReceiptSchema>;
