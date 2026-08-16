import { pool } from "../plugins/pg";
import { apiErrors } from "../utils/apiErrors";
import { updateUserSchema } from "../validation/users.validate";

export const getUsersService = async (
  page: number = 1,
  limit: number = 6,
  search?: string,
) => {
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `
      select
        users.id,
        users.name,
        users.email,
        users.created_at,
        users.updated_at,
        count(distinct places.id)::int as places_count,
        count(*) over()::int as total
      from users
      left join places on places.user_id = users.id
      where
        $1 = ''
        or users.name ilike '%' || $1 || '%'
        or users.email ilike '%' || $1 || '%'
      group by
        users.id,
        users.name,
        users.email,
        users.created_at,
        users.updated_at
      order by users.created_at desc
      limit $2
      offset $3
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
