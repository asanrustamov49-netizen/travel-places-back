import { pool } from "../plugins/pg";

export const getDashboardStatisticsService = async () => {
  const result = await pool.query(`
    SELECT
      (SELECT COUNT(*)::int FROM users) AS total_users,
      (SELECT COUNT(*)::int FROM places) AS total_places,
      (SELECT COUNT(*)::int FROM countries) AS countries,
      (
        SELECT COALESCE(ROUND(AVG(rating), 1), 0)
        FROM place_ratings
      ) AS avg_rating
  `);

  const statistics = result.rows[0];

  return {
    totalUsers: statistics.total_users,
    totalPlaces: statistics.total_places,
    countries: statistics.countries,
    avgRating: Number(statistics.avg_rating),
  };
};
