import { pool } from "../plugins/pg";
import { apiErrors } from "../utils/apiErrors";

export const getCountriesService = async () => {
  const result = await pool.query(`select * from countries`);

  return result.rows;
};

export const getOneCountryService = async (id: number) => {
  const result = await pool.query(
    `
            select * from countries
            where id = $1
            `,
    [id],
  );

  if (!result.rows.length) throw apiErrors.notFound("Country not found!");

  return result.rows[0];
};
