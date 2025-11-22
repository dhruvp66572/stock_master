import { z } from "zod";

export const deliveryItemSchema = z.object({
  productId: z.string().cuid("Invalid product ID"),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .positive("Quantity must be greater than 0"),
});

export const deliverySchema = z.object({
  warehouseId: z.string().cuid("Invalid warehouse ID"),
  scheduleDate: z.string().optional(),
  deliveryAddress: z.string().optional(),
  operationType: z.enum(["DECREMENT", "INCREMENT"], {
    errorMap: () => ({ message: "Operation type must be DECREMENT or INCREMENT" }),
  }),
  notes: z
    .string()
    .max(500, "Notes must not exceed 500 characters")
    .optional()
    .nullable(),
  items: z
    .array(deliveryItemSchema)
    .min(1, "At least one item is required")
    .refine((items) => items.length > 0, {
      message: "Delivery must have at least one item",
    }),
});

export const deliveryValidateSchema = z.object({
  id: z.string().cuid("Invalid delivery ID"),
});

export type DeliveryFormData = z.infer<typeof deliverySchema>;
export type DeliveryItemFormData = z.infer<typeof deliveryItemSchema>;
export type DeliveryValidateData = z.infer<typeof deliveryValidateSchema>;
