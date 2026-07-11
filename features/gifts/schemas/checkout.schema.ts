import { z } from "zod";

export const shippingSchema = z.object({
  full_name: z.string().min(2, "Please enter the recipient's name."),
  phone: z
    .string()
    .min(7, "Enter a valid phone number.")
    .max(20, "That phone number looks too long."),
  line1: z.string().min(3, "Street address is required."),
  line2: z.string().max(255).optional(),
  city: z.string().min(2, "City is required."),
  state: z.string().min(2, "State is required."),
  postal_code: z
    .string()
    .min(4, "Enter a valid postal code.")
    .max(16, "That postal code looks too long."),
  // Backend defaults this to "IN"; kept optional here (India-only for v1).
  country: z.string().optional(),
});

export type ShippingFormValues = z.infer<typeof shippingSchema>;
