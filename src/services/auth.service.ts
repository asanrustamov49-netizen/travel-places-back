import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../plugins/pg";
import { apiErrors } from "../utils/apiErrors";

interface IRegisterBody {
  name: string;
  email: string;
  password: string;
}

interface ILoginBody {
  email: string;
  password: string;
}

export const registerService = async (body: IRegisterBody) => {
  const existingUser = await pool.query(
    `
      select id
      from users
      where email = $1
    `,
    [body.email],
  );

  if (existingUser.rows.length > 0) {
    throw apiErrors.conflict("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(body.password, 10);

  const result = await pool.query(
    `
      insert into users (
        name,
        email,
        password
      )
      values ($1, $2, $3)
      returning id, name, email, created_at
    `,
    [body.name, body.email, hashedPassword],
  );

  return result.rows[0];
};
export const loginService = async (body: ILoginBody) => {
  const result = await pool.query(
    `
      select *
      from users
      where email = $1
    `,
    [body.email],
  );

  if (result.rows.length === 0) {
    throw apiErrors.badRequest("Invalid email or password");
  }

  const user = result.rows[0];

  const isPasswordValid = await bcrypt.compare(body.password, user.password);

  if (!isPasswordValid) {
    throw apiErrors.badRequest("Invalid email or password");
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    "travel-places",
    {
      expiresIn: "1d",
    },
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
};
export const profileService = async (userId: number) => {
  const result = await pool.query(
    `
      SELECT
        users.id,
        users.name,
        users.email,
        users.created_at,
        users.updated_at,

        COUNT(DISTINCT places.id) AS total_places,

        COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'id', places.id,
              'title', places.title,
              'description', places.description,
              'city', places.city,
              'type', places.type,
              'price', places.price,
              'rating', COALESCE(ratings.rating, 0),
              'country_id', countries.id,
              'country_name', countries.name,
              'image',
                CASE
                  WHEN place_images.id IS NOT NULL THEN
                    jsonb_build_object(
                      'id', place_images.id,
                      'image_url', place_images.image_url
                    )
                  ELSE NULL
                END
            )
          ) FILTER (WHERE places.id IS NOT NULL),
          '[]'::jsonb
        ) AS places

      FROM users

      LEFT JOIN places
        ON places.user_id = users.id

      LEFT JOIN countries
        ON places.country_id = countries.id

      LEFT JOIN place_images
        ON place_images.place_id = places.id

      LEFT JOIN LATERAL (
        SELECT
          AVG(pr.rating) AS rating
        FROM place_ratings pr
        WHERE pr.place_id = places.id
      ) ratings
        ON true

      WHERE users.id = $1

      GROUP BY
        users.id,
        users.name,
        users.email,
        users.created_at,
        users.updated_at
    `,
    [userId],
  );

  if (result.rows.length === 0) {
    throw apiErrors.notFound("User not found");
  }

  return result.rows[0];
};
