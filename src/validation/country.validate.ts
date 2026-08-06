import { z } from "zod";

export const countrySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Название страны должно содержать минимум 2 символа")
    .max(100, "Название страны не должно превышать 100 символов"),
});

export type CountrySchema = z.infer<typeof countrySchema>;
