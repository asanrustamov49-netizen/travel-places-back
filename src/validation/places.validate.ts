import { z } from "zod";

export const placeSchema = z.object({
  user_id: z.number(),
  country_id: z.number(),
  title: z
    .string()
    .trim()
    .min(2, "Название должно содержать минимум 2 символа")
    .max(100, "Название не должно превышать 100 символов"),
  description: z
    .string()
    .trim()
    .min(10, "Описание должно содержать минимум 10 символов"),
  city: z
    .string()
    .trim()
    .min(2, "Название города должно содержать минимум 2 символа")
    .max(100),
  type: z.enum(["Beach", "Culture", "Adventure", "Nature", "City"]),
  price: z.number().min(0, "Цена не может быть отрицательной"),
});

export const updatePlaceSchema = placeSchema
  .omit({
    user_id: true,
  })
  .partial();

export type PlaceSchema = z.infer<typeof placeSchema>;

export type UpdatePlaceSchema = z.infer<typeof updatePlaceSchema>;
