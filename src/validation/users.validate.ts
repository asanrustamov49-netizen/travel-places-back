import { z } from "zod";

export const userSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Имя должно содержать минимум 2 символа")
    .max(55, "Имя не должно превышать 55 символов"),

  email: z
    .string()
    .trim()
    .email("Введите корректный email")
    .max(255, "Email не должен превышать 255 символов"),

  password: z
    .string()
    .min(6, "Пароль должен содержать минимум 6 символов")
    .max(100, "Пароль не должен превышать 100 символов"),
});

export type UserSchema = z.infer<typeof userSchema>;

export const UpdateUserSchema = z.object({
  name: z.string().trim().min(2).max(50).optional(),

  email: z.string().trim().email().optional(),
});

export type updateUserSchema = z.infer<typeof UpdateUserSchema>;
