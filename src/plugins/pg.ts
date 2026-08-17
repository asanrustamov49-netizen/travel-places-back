import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect().then(() => {
  console.log("DB connected");
});
