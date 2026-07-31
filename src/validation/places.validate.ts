import { z } from "zod";

export const placeSchema = z.object({
  country_id: z
    .number()
    .int("ID страны должен быть целым числом")
    .positive("ID страны должен быть положительным"),

  user_id: z
    .number()
    .int("ID страны должен быть целым числом")
    .positive("ID страны должен быть положительным"),

  title: z
    .string()
    .trim()
    .min(3, "Название места должно содержать минимум 3 символа")
    .max(120, "Название места не должно превышать 120 символов"),

  description: z
    .string()
    .trim()
    .min(10, "Описание должно содержать минимум 10 символов"),

  city: z
    .string()
    .trim()
    .min(2, "Название города должно содержать минимум 2 символа")
    .max(100, "Название города не должно превышать 100 символов"),

  type: z.enum(["Beach", "Culture", "Adventure", "Nature", "City"]),

  price: z.number().min(0, "Цена не может быть отрицательной"),
});

export type PlaceSchema = z.infer<typeof placeSchema>;
