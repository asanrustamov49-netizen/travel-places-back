import { pool } from "../plugins/pg";
import { apiErrors } from "../utils/apiErrors";

export interface IPlaceBody {
  user_id: number;
  country_id: number;
  title: string;
  description: string;
  city: string;
  type: "Beach" | "Culture" | "Adventure" | "Nature" | "City";
  price: number;
}

export const postPlaceService = async (body: IPlaceBody) => {
  const result = await pool.query(
    `
        insert into places
        (user_id, country_id, title, description, city, type, price)
        values ($1, $2, $3, $4, $5, $6, $7)
        returning *
        `,
    [
      body.user_id,
      body.country_id,
      body.title,
      body.description,
      body.city,
      body.type,
      body.price,
    ],
  );

  return result.rows[0];
};

export const getPlacesService = async () => {
  const result = await pool.query(`select * from places`);

  return result.rows;
};

export const getOnePlaceService = async (id: number) => {
  const result = await pool.query(
    `
        select * from places
        where id = $1
        `,
    [id],
  );

  if (!result.rows[0].id) throw apiErrors.notFound("ID not found!");

  return result.rows[0];
};

export const deletePlaceService = async (id: number) => {
  const result = await pool.query(
    `
        delete from places
        where id = $1
        returning *
        `,
    [id],
  );

  if (!result.rows[0].id) throw apiErrors.notFound("ID not found!");

  return result.rows[0];
};

export const updatePlaceService = async (
  id: number,
  body: Partial<IPlaceBody>,
) => {
  const result = await pool.query(
    `
        update places
        set user_id=$1, country_id=$2, title=$3, description=$4, city=$5, type=$6, price=$7
        where id=$8
        returning *
        `,
    [
      body.user_id,
      body.country_id,
      body.title,
      body.description,
      body.city,
      body.type,
      body.price,
      id,
    ],
  );

  if (!result.rows[0].id) throw apiErrors.notFound("ID not found!");

  return result.rows[0];
};
