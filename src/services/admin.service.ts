import { pool } from "../plugins/pg";

export const getDashboardStatisticsService = async () => {
  const result = await pool.query(`
    select
      (select count(*)::int from users) as total_users,
      (select count(*)::int from places) as total_places,
      (select count(*)::int from countries) as countries,
      (
        select coalesce(round(avg(rating), 1), 0)
        from place_ratings
      ) as avg_rating
  `);

  return {
    totalUsers: result.rows[0].total_users,
    totalPlaces: result.rows[0].total_places,
    countries: result.rows[0].countries,
    avgRating: Number(result.rows[0].avg_rating),
  };
};
