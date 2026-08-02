import { pool } from "../plugins/pg";
import { apiErrors } from "../utils/apiErrors";
import { CountrySchema } from "../validation/country.validate";

export const postCountryService = async (body: CountrySchema) => {
  const result = await pool.query(
    `
        insert into countries
        (name, continent)
        values ($1, $2)
        returning *
        `,
    [body.name, body.continent],
  );

  return result.rows[0];
};
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

  if (!result.rows[0].id) throw apiErrors.notFound("ID not found!");

  return result.rows[0];
};
export const deleteCountryService = async (id: number) => {
  const result = await pool.query(
    `
        delete from countries
        where id = $1
        returning *
        `,
    [id],
  );

  if (!result.rows[0].id) throw apiErrors.notFound("ID not found!");

  return result.rows[0];
};
export const updateCountryService = async (
  id: number,
  body: Partial<CountrySchema>,
) => {
  const result = await pool.query(
    `
        update countries
        set name=$1, continent=$2
        where id=$3
        returning *
        `,
    [body.name, body.continent, id],
  );

  if (!result.rows[0].id) throw apiErrors.notFound("ID not found!");

  return result.rows[0];
};
