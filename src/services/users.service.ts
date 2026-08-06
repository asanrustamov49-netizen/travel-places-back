import { pool } from "../plugins/pg";
import { apiErrors } from "../utils/apiErrors";
import { updateUserSchema, UserSchema } from "../validation/users.validate";

export const getUsersService = async () => {
  const result = await pool.query(`
    select
      id,
      name,
      email,
      created_at,
      updated_at
    from users
  `);

  return result.rows;
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
      select
        user.id,
        user.name,
        user.email,
        user.created_at,
        user.updated_at,
        count(distinct places.id) as places_count,
        count(distinct places.country_id) as countries_count
      from users
      left join places on places.user_id = user.id
      where user.id = $1
      group by
        user.id,
        user.name,
        user.email,
        user.created_at,
        user.updated_at
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
        places.created_at,
        country.id as country_id,
        country.name as country_name
      from places
      left join countries on places.country_id = country.id
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
