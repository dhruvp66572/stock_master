import { z } from "zod";

export const transferItemSchema = z.object({
  productId: z.string().cuid("Invalid product ID"),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .positive("Quantity must be greater than 0"),
});

export const transferSchema = z.object({
  fromWarehouseId: z.string().cuid("Invalid source warehouse ID"),
  toWarehouseId: z.string().cuid("Invalid destination warehouse ID"),
  notes: z
    .string()
    .max(500, "Notes must not exceed 500 characters")
    .optional()
    .nullable(),
  items: z
    .array(transferItemSchema)
    .min(1, "At least one item is required")
    .refine((items) => items.length > 0, {
      message: "Transfer must have at least one item",
    }),
}).refine(
  (data) => data.fromWarehouseId !== data.toWarehouseId,
  {
    message: "Source and destination warehouses must be different",
    path: ["toWarehouseId"],
  }
);

export const transferCompleteSchema = z.object({
  id: z.string().cuid("Invalid transfer ID"),
});

export type TransferFormData = z.infer<typeof transferSchema>;
export type TransferItemFormData = z.infer<typeof transferItemSchema>;
export type TransferCompleteData = z.infer<typeof transferCompleteSchema>;
