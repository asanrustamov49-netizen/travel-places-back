import { Pool } from "pg";

export const pool = new Pool({
  database: "travel-places",
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "1011",
});

pool.connect().then(() => {
  console.log("DB connected");
});
