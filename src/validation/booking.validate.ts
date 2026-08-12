import { z } from "zod";

export const bookingSchema = z
  .object({
    check_in: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Check-in must be in YYYY-MM-DD format"),

    check_out: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Check-out must be in YYYY-MM-DD format"),

    guests_count: z.coerce
      .number({
        message: "Guests count must be a number",
      })
      .int("Guests count must be an integer")
      .min(1, "Guests count must be at least 1"),
  })
  .refine(
    (data) => {
      const checkIn = new Date(`${data.check_in}T00:00:00Z`);
      const checkOut = new Date(`${data.check_out}T00:00:00Z`);

      return checkOut > checkIn;
    },
    {
      message: "Check-out must be later than check-in",
      path: ["check_out"],
    },
  )
  .refine(
    (data) => {
      const today = new Date();

      const todayString = today.toISOString().split("T")[0];

      return data.check_in >= todayString!;
    },
    {
      message: "Check-in cannot be in the past",
      path: ["check_in"],
    },
  );

export type BookingSchema = z.infer<typeof bookingSchema>;
