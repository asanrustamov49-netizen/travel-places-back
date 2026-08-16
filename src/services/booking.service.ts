import { NextFunction } from "express";
import { pool } from "../plugins/pg";
import { apiErrors } from "../utils/apiErrors";

interface ICreateBookingData {
  check_in: string;
  check_out: string;
  guests_count: number;
}

export const createBooking = async (
  userId: number,
  placeId: number,
  data: ICreateBookingData,
  next: NextFunction,
) => {
  const client = await pool.connect();

  try {
    const placeResult = await client.query(
      `
        select id, title, price
        from places
        where id = $1;
      `,
      [placeId],
    );

    const place = placeResult.rows[0];

    const conflictResult = await client.query(
      `
        select id
        from bookings
        where place_id = $1
          and status in ('pending', 'confirmed')
          and not (
            check_out <= $2::date
            or check_in >= $3::date
          )
        limit 1;
      `,
      [placeId, data.check_in, data.check_out],
    );

    if (conflictResult.rows.length > 0) {
      const error = new Error(
        "This place is already booked for the selected dates",
      );

      (error as any).statusCode = 409;

      throw error;
    }

    // 3. Считаем количество ночей
    const millisecondsPerDay = 1000 * 60 * 60 * 24;

    const nights = Math.round(
      (new Date(`${data.check_out}T00:00:00Z`).getTime() -
        new Date(`${data.check_in}T00:00:00Z`).getTime()) /
        millisecondsPerDay,
    );

    // 4. Считаем итоговую стоимость
    const totalPrice = nights * Number(place.price);

    // 5. Создаём бронь
    const bookingResult = await client.query(
      `
        insert into bookings (
          user_id,
          place_id,
          check_in,
          check_out,
          guests_count,
          total_price,
          status
        )
        values ($1, $2, $3, $4, $5, $6, 'pending')
        returning *;
      `,
      [
        userId,
        placeId,
        data.check_in,
        data.check_out,
        data.guests_count,
        totalPrice,
      ],
    );

    return bookingResult.rows[0];
  } catch (error: any) {
    next(error.message);
  }
};

export const getMyBookings = async (userId: number) => {
  const result = await pool.query(
    `
      select
        bookings.id,
        bookings.check_in,
        bookings.check_out,
        bookings.guests_count,
        bookings.total_price,
        bookings.status,
        bookings.created_at,
        places.id as place_id,
        places.title as place_title,
        places.city as place_city,
        places.price as price_per_night,
        countries.name as country_name
      from bookings
      join places on places.id = bookings.place_id
      join countries on countries.id = places.country_id
      where bookings.user_id = $1
      order by bookings.created_at desc;
    `,
    [userId],
  );

  return result.rows;
};

export const getOneMyBooking = async (userId: number, bookingId: number) => {
  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    const error = apiErrors.badRequest("Invalid bookingId!");
    throw error;
  }

  const result = await pool.query(
    `
      select
        bookings.id,
        bookings.check_in,
        bookings.check_out,
        bookings.guests_count,
        bookings.total_price,
        bookings.status,
        bookings.created_at,
        places.id as place_id,
        places.title as place_title,
        places.city as place_city,
        places.price as price_per_night,
        countries.name as country_name
      from bookings
      join places on places.id = bookings.place_id
      join countries on countries.id = places.country_id
      where bookings.id = $1
        and bookings.user_id = $2;
    `,
    [bookingId, userId],
  );

  if (result.rows.length === 0) {
    const error = apiErrors.notFound("Booking not found!");
    throw error;
  }

  return result.rows[0];
};
