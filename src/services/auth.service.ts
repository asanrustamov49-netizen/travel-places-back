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

  const isPasswordValid = await bcrypt.compare(body.password, result.rows[0].password);

  if (!isPasswordValid) {
    throw apiErrors.badRequest("Invalid email or password");
  }

  const token = jwt.sign(
    {
      id: result.rows[0].id,
      email: result.rows[0].email,
    },
    "travel-places",
    {
      expiresIn: "1d",
    },
  );

  return {
    token,
    user: {
      id: result.rows[0].id,
      name: result.rows[0].name,
      email: result.rows[0].email,
    },
  };
};
export const profileService = async (userId: number) => {
  const result = await pool.query(
    `
      select
        users.id,
        users.name,
        users.email,
        users.created_at,
        users.updated_at,
        count(distinct places.id) as total_places,
        coalesce(
          jsonb_agg(
            jsonb_build_object(
              'id', places.id,
              'title', places.title,
              'description', places.description,
              'city', places.city,
              'type', places.type,
              'price', places.price,
              'rating', coalesce(ratings.rating, 0),
              'country_id', countries.id,
              'country_name', countries.name,
              'image',
                case
                  when place_image.id is not null then
                    jsonb_build_object(
                      'id', place_image.id,
                      'image_url', place_image.image_url
                    )
                  else null
                end
            )
          ) filter (where places.id is not null),
          '[]'::jsonb
        ) as places
      from users
      left join places on places.user_id = users.id
      left join countries on places.country_id = countries.id
      left join lateral (
        select
          id,
          image_url
        from place_images
        where place_images.place_id = places.id
        order by place_images.created_at asc
        limit 1
      ) as place_image on true
      left join lateral (
        select
          avg(place_ratings.rating) as rating
        from place_ratings place_ratings
        where place_ratings.place_id = places.id
      ) ratings
        on true
      where users.id = $1
      group by
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
