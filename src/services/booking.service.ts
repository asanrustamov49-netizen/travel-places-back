import { pool } from "../plugins/pg";

interface ICreateBookingData {
  check_in: string;
  check_out: string;
  guests_count: number;
}

export const createBooking = async (
  userId: number,
  placeId: number,
  data: ICreateBookingData,
) => {
  if (!Number.isInteger(placeId) || placeId <= 0) {
    const error = new Error("Invalid placeId");
    (error as any).statusCode = 400;
    throw error;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Получаем место
    const placeResult = await client.query(
      `
        SELECT id, title, price
        FROM places
        WHERE id = $1;
      `,
      [placeId],
    );

    if (placeResult.rows.length === 0) {
      const error = new Error("Place not found");
      (error as any).statusCode = 404;
      throw error;
    }

    const place = placeResult.rows[0];

    // 2. Проверяем пересечение брони
    const conflictResult = await client.query(
      `
        SELECT id
        FROM bookings
        WHERE place_id = $1
          AND status IN ('pending', 'confirmed')
          AND NOT (
            check_out <= $2::date
            OR check_in >= $3::date
          )
        LIMIT 1;
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
        INSERT INTO bookings (
          user_id,
          place_id,
          check_in,
          check_out,
          guests_count,
          total_price,
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'pending')
        RETURNING *;
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

    await client.query("COMMIT");

    return bookingResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const getMyBookings = async (userId: number) => {
  const result = await pool.query(
    `
      SELECT
        bookings.id,
        bookings.check_in,
        bookings.check_out,
        bookings.guests_count,
        bookings.total_price,
        bookings.status,
        bookings.created_at,

        places.id AS place_id,
        places.title AS place_title,
        places.city AS place_city,
        places.price AS price_per_night,

        countries.name AS country_name

      FROM bookings

      JOIN places
        ON places.id = bookings.place_id

      JOIN countries
        ON countries.id = places.country_id

      WHERE bookings.user_id = $1

      ORDER BY bookings.created_at DESC;
    `,
    [userId],
  );

  return result.rows;
};

export const getOneMyBooking = async (userId: number, bookingId: number) => {
  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    const error = new Error("Invalid bookingId");
    (error as any).statusCode = 400;
    throw error;
  }

  const result = await pool.query(
    `
      SELECT
        bookings.id,
        bookings.check_in,
        bookings.check_out,
        bookings.guests_count,
        bookings.total_price,
        bookings.status,
        bookings.created_at,

        places.id AS place_id,
        places.title AS place_title,
        places.city AS place_city,
        places.price AS price_per_night,

        countries.name AS country_name

      FROM bookings

      JOIN places
        ON places.id = bookings.place_id

      JOIN countries
        ON countries.id = places.country_id

      WHERE bookings.id = $1
        AND bookings.user_id = $2;
    `,
    [bookingId, userId],
  );

  if (result.rows.length === 0) {
    const error = new Error("Booking not found");
    (error as any).statusCode = 404;
    throw error;
  }

  return result.rows[0];
};
