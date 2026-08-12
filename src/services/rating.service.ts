import { pool } from "../plugins/pg";
import { apiErrors } from "../utils/apiErrors";

export const postRatingService = async (
  userId: number,
  placeId: number,
  rating: number,
) => {
  const place = await pool.query(
    `
      select id
      from places
      where id = $1
    `,
    [placeId],
  );

  if (!place.rows.length) {
    throw apiErrors.notFound("Place not found!");
  }

  const existingRating = await pool.query(
    `
      select id
      from place_ratings
      where user_id = $1 and place_id = $2
    `,
    [userId, placeId],
  );

  if (existingRating.rows.length) {
    throw apiErrors.conflict("You have already rated this place!");
  }

  const result = await pool.query(
    `
      insert into place_ratings (
        user_id,
        place_id,
        rating
      )
      values ($1, $2, $3)
      returning
        id,
        user_id,
        place_id,
        rating,
        created_at
    `,
    [userId, placeId, rating],
  );


  return result.rows[0];
};

export const getPlaceRatingsService = async (placeId: number) => {
  const place = await pool.query(
    `
      select id
      from places
      where id = $1
    `,
    [placeId],
  );

  if (!place.rows.length) {
    throw apiErrors.notFound("Place not found!");
  }

  const result = await pool.query(
    `
     SELECT
       COALESCE(ROUND(AVG(rating), 1), 0) AS rating,
       COUNT(id) AS ratings_count
      FROM place_ratings
      WHERE place_id = $1
    `,
    [placeId],
  );

  return result.rows[0];
};

export const updateRatingService = async (
  userId: number,
  placeId: number,
  rating: number,
) => {
  const result = await pool.query(
    `
      update place_ratings
      set rating = $1
      where user_id = $2 and place_id = $3
      returning
        id,
        user_id,
        place_id,
        rating,
        updated_at
    `,
    [rating, userId, placeId],
  );

  if (!result.rows.length) {
    throw apiErrors.notFound("Rating not found!");
  }

  return result.rows[0];
};

export const deleteRatingService = async (userId: number, placeId: number) => {
  const result = await pool.query(
    `
      delete from place_ratings
      where user_id = $1 and place_id = $2
      returning
        id,
        user_id,
        place_id,
        rating
    `,
    [userId, placeId],
  );

  if (!result.rows.length) {
    throw apiErrors.notFound("Rating not found!");
  }

  return result.rows[0];
};
