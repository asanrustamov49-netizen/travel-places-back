import { ICreatePlace } from "../controllers/places.controller";
import { pool } from "../plugins/pg";
import { apiErrors } from "../utils/apiErrors";
import { PlaceSchema, UpdatePlaceSchema } from "../validation/places.validate";

export const postPlaceService = async (body: ICreatePlace) => {
  const result = await pool.query(
    `
      insert into places
      (
        user_id,
        country_id,
        title,
        description,
        city,
        type,
        price
      )
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
        places.best_season,
        places.created_at,
        users.id as user_id,
        users.name as author_name,
        countries.id as country_id,
        countries.name as country_name
      from places
      left join users on places.user_id = users.id
      left join countries on places.country_id = countries.id
      order by places.created_at desc
    `,
  );

  return result.rows;
};

export const getOnePlaceService = async (id: number) => {
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
        places.best_season,
        places.created_at,
        places.updated_at,
        users.id as user_id,
        users.name as author_name,
        countries.id as country_id,
        countries.name as country_name
      from places
      left join users on places.user_id = users.id
      left join countries on places.country_id = countries.id
      where places.id = $1
    `,
    [id],
  );

  if (!result.rows.length) {
    throw apiErrors.notFound("Place not found!");
  }

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

  if (!result.rows.length) {
    throw apiErrors.notFound("Place not found!");
  }

  return result.rows[0];
};

export const updatePlaceService = async (
  id: number,
  body: Partial<UpdatePlaceSchema>,
) => {
  const result = await pool.query(
    `
      update places
      set user_id = $1, 
      country_id = $2, 
      title = $3, 
      description = $4, 
      city = $5,
      type = $6,
      price = $7,
      updated_at = now()
      where id = $8
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

  if (!result.rows.length) {
    throw apiErrors.notFound("Place not found!");
  }

  return result.rows[0];
};

// ==============================
// FILTER + SORT + PAGINATION
// ==============================

export interface IGetPlacesParams {
  type?: string;
  country_id?: number;
  price_min?: number;
  price_max?: number;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export const getPlacesFilteredService = async ({
  type,
  country_id,
  price_min,
  price_max,
  search,
  sort = "newest",
  page = 1,
  limit = 6,
}: IGetPlacesParams) => {
  const values: any[] = [];
  const conditions: string[] = [];

  // TYPE
  if (type) {
    values.push(type);
    conditions.push(`places.type = $${values.length}`);
  }

  // COUNTRY
  if (country_id) {
    values.push(country_id);
    conditions.push(`places.country_id = $${values.length}`);
  }

  // MIN PRICE
  if (price_min) {
    values.push(price_min);
    conditions.push(`places.price >= $${values.length}`);
  }

  // MAX PRICE
  if (price_max) {
    values.push(price_max);
    conditions.push(`places.price <= $${values.length}`);
  }

  // SEARCH
  if (search) {
    values.push(`%${search}%`);

    conditions.push(`
      (
        places.title ilike $${values.length}
        or places.city ilike $${values.length}
        or countries.name ilike $${values.length}
      )
    `);
  }

  const where =
    conditions.length > 0 ? `where ${conditions.join(" and ")}` : "";
    
  // SORT
  let orderBy = "places.created_at desc";

  switch (sort) {
    case "price-low":
      orderBy = "places.price asc";
      break;

    case "price-high":
      orderBy = "places.price desc";
      break;

    case "rating":
      orderBy = "places.rating desc";
      break;

    case "alphabetical":
      orderBy = "places.title asc";
      break;

    case "newest":
    default:
      orderBy = "places.created_at desc";
      break;
  }

  const offset = (page - 1) * limit;

  values.push(limit);
  const limitIndex = values.length;

  values.push(offset);
  const offsetIndex = values.length;

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
        places.best_season,
        places.created_at,
        users.id as user_id,
        users.name as author_name,
        users.avatar as author_avatar,
        countries.id as country_id,
        countries.name as country_name
      from places 
      left join users on places.user_id = users.id
      left join countries on places.country_id = countries.id
      ${where}
      order by ${orderBy}
      limit $${limitIndex}
      offset $${offsetIndex}
    `,
    values,
  );

  return result.rows;
};

// export const uploadPlaceImagesService = async (
//   placeId: number,
//   imagePaths: string[],
// ) => {
//   const values: string[] = [];
//   const placeholders: string[] = [];

//   imagePaths.forEach((imagePath, index) => {
//     values.push(placeId.toString(), imagePath);

//     const first = index * 2 + 1;
//     const second = index * 2 + 2;

//     placeholders.push(`($${first}, $${second})`);
//   });

//   const result = await pool.query(
//     `
//       INSERT INTO place_images
//       (place_id, image_url)
//       VALUES ${placeholders.join(", ")}
//       RETURNING *
//     `,
//     values,
//   );

//   return result.rows;
// };
