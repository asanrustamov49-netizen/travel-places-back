import { pool } from "../plugins/pg";
import { IGetUsersParams } from "../types/user.types";
import { apiErrors } from "../utils/apiErrors";
import { updateUserSchema, UserSchema } from "../validation/users.validate";

export const getUsersService = async (
  page: number = 1,
  limit: number = 6,
  search?: string,
) => {
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `
      SELECT
        users.id,
        users.name,
        users.email,
        users.created_at,
        users.updated_at,

        COUNT(DISTINCT places.id)::int AS places_count,

        COUNT(*) OVER()::int AS total

      FROM users

      LEFT JOIN places
        ON places.user_id = users.id

      WHERE
        $1 = ''
        OR users.name ILIKE '%' || $1 || '%'
        OR users.email ILIKE '%' || $1 || '%'

      GROUP BY
        users.id,
        users.name,
        users.email,
        users.created_at,
        users.updated_at

      ORDER BY users.created_at DESC

      LIMIT $2
      OFFSET $3
    `,
    [search ?? "", limit, offset],
  );

  const total = result.rows[0]?.total ?? 0;

  return {
    data: result.rows.map(({ total, ...user }) => user),
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};
export const getOneUserService = async (id: number) => {
  const result = await pool.query(
    `
      select
        id,
        name,
        email,
        created_at,
        updated_at
      from users
      where id = $1
    `,
    [id],
  );

  if (!result.rows.length) {
    throw apiErrors.notFound("User not found!");
  }

  return result.rows[0];
};

export const getUserProfileService = async (id: number) => {
  const result = await pool.query(
    `
      SELECT
        users.id,
        users.name,
        users.email,
        users.created_at,
        users.updated_at,

        COUNT(DISTINCT places.id)::int AS total_places,

        COUNT(DISTINCT places.country_id)::int AS total_countries,

        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', places.id,
              'title', places.title,
              'description', places.description,
              'city', places.city,
              'type', places.type,
              'price', places.price,
              'rating', places.rating,
              'country_id', countries.id,
              'country_name', countries.name,
              'image', (
                SELECT jsonb_build_object(
                  'id', place_images.id,
                  'image_url', place_images.image_url
                )
                FROM place_images
                WHERE place_images.place_id = places.id
                ORDER BY place_images.id ASC
                LIMIT 1
              )
            )
          ) FILTER (WHERE places.id IS NOT NULL),
          '[]'::json
        ) AS places

      FROM users

      LEFT JOIN places
        ON places.user_id = users.id

      LEFT JOIN countries
        ON places.country_id = countries.id

      WHERE users.id = $1

      GROUP BY
        users.id,
        users.name,
        users.email,
        users.created_at,
        users.updated_at
    `,
    [id],
  );

  if (!result.rows.length) {
    throw apiErrors.notFound("User not found!");
  }

  return result.rows[0];
};

export const getUserPlacesService = async (userId: number) => {
  const result = await pool.query(
    `
      select
        places.id,
        places.title,
        places.description,
        places.city,
        places.type,
        places.price,
        places.rating,

        countries.id as country_id,
        countries.name as country_name,

        case
          when place_images.id is not null then
            json_build_object(
              'id', place_images.id,
              'image_url', place_images.image_url
            )
          else null
        end as image

      from places

      left join countries
        on places.country_id = countries.id

      left join lateral (
        select
          id,
          image_url
        from place_images
        where place_images.place_id = places.id
        order by place_images.id asc
        limit 1
      ) as place_images
        on true

      where places.user_id = $1

      order by places.created_at desc
    `,
    [userId],
  );

  return result.rows;
};

// export const checkUserEmailService = async (email: string) => {
//   const result = await pool.query(
//     `
//       SELECT id
//       FROM users
//       WHERE email = $1
//     `,
//     [email],
//   );

//   return result.rows.length > 0;
// };

export const updateUserService = async (
  id: number,
  body: Partial<updateUserSchema>,
) => {
  if (body.email) {
    const email = await pool.query(
      `
        select id from users
        where email = $1 and id != $2
      `,
      [body.email, id],
    );

    if (email.rows.length) {
      throw apiErrors.conflict("This email is already in use!");
    }
  }

  const result = await pool.query(
    `
      update users
      set name = $1, email = $2, updated_at = now()
      where id = $3
      returning
        id,
        name,
        email,
        created_at,
        updated_at
    `,
    [body.name, body.email, id],
  );

  return result.rows[0];
};

export const deleteUserService = async (id: number) => {
  const result = await pool.query(
    `
      delete from users
      where id = $1
      returning
        id,
        name,
        email
    `,
    [id],
  );

  if (!result.rows.length) {
    throw apiErrors.notFound("User not found!");
  }

  return result.rows[0];
};
