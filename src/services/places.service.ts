import { ICreatePlace } from "../controllers/places.controller";
import { pool } from "../plugins/pg";
import { apiErrors } from "../utils/apiErrors";
import { PlaceSchema, UpdatePlaceSchema } from "../validation/places.validate";

export const postPlaceService = async (body: ICreatePlace) => {
  const result = await pool.query(
    `
      INSERT INTO places
      (
        user_id,
        country_id,
        title,
        description,
        city,
        type,
        price
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
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

  const place = result.rows[0];

  if (body.images.length > 0) {
    const values = body.images.flatMap((imageUrl) => [place.id, imageUrl]);
    const placeholders = body.images
      .map((_, index) => `($${index * 2 + 1}, $${index * 2 + 2})`)
      .join(", ");

    await pool.query(
      `INSERT INTO place_images (place_id, image_url) VALUES ${placeholders}`,
      values,
    );
  }

  return place;
};

export const getPlacesService = async () => {
  const result = await pool.query(`
    SELECT
      places.id,
      places.title,
      places.description,
      places.city,
      places.type,
      places.price,

      COALESCE(AVG(place_ratings.rating), 0) AS rating,
      COUNT(place_ratings.id) AS ratings_count,

      places.created_at,

      users.id AS user_id,
      users.name AS author_name,

      countries.id AS country_id,
      countries.name AS country_name,

      CASE
        WHEN place_image.id IS NOT NULL THEN
          json_build_object(
            'id', place_image.id,
            'image_url', place_image.image_url
          )
        ELSE NULL
      END AS image

    FROM places

    LEFT JOIN users
      ON places.user_id = users.id

    LEFT JOIN countries
      ON places.country_id = countries.id

    LEFT JOIN place_ratings
      ON places.id = place_ratings.place_id

    LEFT JOIN LATERAL (
      SELECT
        id,
        image_url
      FROM place_images
      WHERE place_images.place_id = places.id
      ORDER BY place_images.created_at ASC
      LIMIT 1
    ) AS place_image ON TRUE

    GROUP BY
      places.id,
      users.id,
      countries.id,
      place_image.id,
      place_image.image_url

    ORDER BY places.created_at DESC
  `);

  return result.rows;
};
export const getOnePlaceService = async (id: number) => {
  const result = await pool.query(
    `
      SELECT
        places.id,
        places.title,
        places.description,
        places.city,
        places.type,
        places.price,

        COALESCE(AVG(place_ratings.rating), 0) AS rating,
        COUNT(place_ratings.id) AS ratings_count,

        places.created_at,
        places.updated_at,

        users.id AS user_id,
        users.name AS author_name,

        countries.id AS country_id,
        countries.name AS country_name,

        CASE
          WHEN place_image.id IS NOT NULL THEN
            json_build_object(
              'id', place_image.id,
              'image_url', place_image.image_url
            )
          ELSE NULL
        END AS image

      FROM places

      LEFT JOIN users
        ON places.user_id = users.id

      LEFT JOIN countries
        ON places.country_id = countries.id

      LEFT JOIN place_ratings
        ON places.id = place_ratings.place_id

      LEFT JOIN LATERAL (
        SELECT
          id,
          image_url
        FROM place_images
        WHERE place_images.place_id = places.id
        ORDER BY place_images.created_at ASC
        LIMIT 1
      ) AS place_image ON TRUE

      WHERE places.id = $1

      GROUP BY
        places.id,
        users.id,
        countries.id,
        place_image.id,
        place_image.image_url
    `,
    [id],
  );

  if (!result.rows.length) {
    throw apiErrors.notFound("Place not found!");
  }

  return result.rows[0];
};

export const deletePlaceService = async (id: number, userId: number) => {
  const result = await pool.query(
    `
      delete from places
      where id = $1 and user_id = $2
      returning *
    `,
    [id, userId],
  );

  if (!result.rows.length) {
    throw apiErrors.notFound("Place not found!");
  }

  return result.rows[0];
};

export const updatePlaceService = async (
  id: number,
  userId: number,
  body: Partial<UpdatePlaceSchema>,
) => {
  const result = await pool.query(
    `
      update places
      set country_id = $1,
          title = $2,
          description = $3,
          city = $4,
          type = $5,
          price = $6,
          updated_at = now()
      where id = $7 and user_id = $8
      returning *
    `,
    [
      body.country_id,
      body.title,
      body.description,
      body.city,
      body.type,
      body.price,
      id,
      userId,
    ],
  );

  if (!result.rows.length) {
    throw apiErrors.notFound("Place not found!");
  }

  return result.rows[0];
};

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

  if (type) {
    values.push(type);
    conditions.push(`places.type = $${values.length}`);
  }

  if (country_id) {
    values.push(country_id);
    conditions.push(`places.country_id = $${values.length}`);
  }

  if (price_min) {
    values.push(price_min);
    conditions.push(`places.price >= $${values.length}`);
  }

  if (price_max) {
    values.push(price_max);
    conditions.push(`places.price <= $${values.length}`);
  }

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

  let orderBy = "places.created_at desc";

  switch (sort) {
    case "price-low":
      orderBy = "places.price asc";
      break;

    case "price-high":
      orderBy = "places.price desc";
      break;

    case "rating":
      orderBy = "rating desc";
      break;

    case "alphabetical":
      orderBy = "places.title asc";
      break;

    case "newest":
    default:
      orderBy = "places.created_at desc";
      break;
  }

  const countResult = await pool.query(
    `
    select count(*) as total
    from places
    left join countries on places.country_id = countries.id
    ${where}
  `,
    values,
  );

  const total = Number(countResult.rows[0].total);

  const offset = (page - 1) * limit;

  values.push(limit);
  const limitIndex = values.length;

  values.push(offset);
  const offsetIndex = values.length;

  const result = await pool.query(
    `
    SELECT
      places.id,
      places.title,
      places.description,
      places.city,
      places.type,
      places.price,
      COALESCE(AVG(place_ratings.rating), 0) AS rating,
      COUNT(place_ratings.id) AS ratings_count,
      places.created_at,

      users.id AS user_id,
      users.name AS author_name,

      countries.id AS country_id,
      countries.name AS country_name,

      CASE
        WHEN place_image.id IS NOT NULL THEN
          json_build_object(
            'id', place_image.id,
            'image_url', place_image.image_url
          )
        ELSE NULL
      END AS image

    FROM places

    LEFT JOIN users
      ON places.user_id = users.id

    LEFT JOIN countries
      ON places.country_id = countries.id

    LEFT JOIN place_ratings
      ON places.id = place_ratings.place_id

    LEFT JOIN LATERAL (
      SELECT
        id,
        image_url
      FROM place_images
      WHERE place_images.place_id = places.id
      ORDER BY place_images.created_at ASC
      LIMIT 1
    ) AS place_image ON TRUE

    ${where}

    GROUP BY
      places.id,
      users.id,
      countries.id,
      place_image.id,
      place_image.image_url

    ORDER BY ${orderBy}

    LIMIT $${limitIndex}
    OFFSET $${offsetIndex}
  `,
    values,
  );

  return {
    data: result.rows,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
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
