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
      expiresIn: "7d",
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
    select
      users.id,
      users.name,
      users.email,
      users.created_at,
      users.updated_at,
      count(distinct places.id) as total_places,
      coalesce(
        json_agg(
          distinct json_build_object(
            'id', places.id,
            'title', places.title,
            'city', places.city,
            'price', places.price,
            'type', places.type,
            'image', place_images.image_url
          )
        ) filter (where places.id is not null),
        '[]'
      ) as places
    from users
    left join places on places.user_id = users.id
    left join place_images on place_images.place_id = places.id
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
