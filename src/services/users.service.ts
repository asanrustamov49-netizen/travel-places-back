import { pool } from "../plugins/pg";
import { apiErrors } from "../utils/apiErrors";
import { UserSchema } from "../validation/users.validate";

export const getUsersService = async () => {
  const result = await pool.query(`select * from users`);

  return result.rows;
};
export const getOneUserService = async (id: number) => {
  const result = await pool.query(
    `
                select * from users
                where id = $1
                `,
    [id],
  );

  if (!result.rows[0].id) throw apiErrors.notFound("ID not found!");

  return result.rows[0];
};
export const deleteUserService = async (id: number) => {
  const result = await pool.query(
    `
        delete from users
        where id = $1
        returning *
        `,
    [id],
  );

  if (!result.rows[0].id) throw apiErrors.notFound("ID not found!");

  return result.rows[0];
};
export const updateUserService = async (
  id: number,
  body: Partial<UserSchema>,
) => {
  const result = await pool.query(
    `
        update users
        set name=$1, email=$2, password=$3, avatar=$4
        where id=$5
        returning *
        `,
    [body.name, body.email, body.password, body.avatar, id],
  );

  if (!result.rows[0].id) throw apiErrors.notFound("ID not found!");

  return result.rows[0];
};
