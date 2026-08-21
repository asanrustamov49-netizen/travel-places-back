import { Pool } from "pg";
import fs from "fs";
import path from "path";

const pool = new Pool({
  connectionString:
    "postgresql://postgre:XNDpjUoPM4nE51Ap75HSjNqhCZczTKA0@dpg-da1fl7k9v7es73bai0d0-a.oregon-postgres.render.com/travel_places_by9o",
  ssl: {
    rejectUnauthorized: false,
  },
});

const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf-8");

pool
  .query(sql)
  .then(() => {
    console.log("✅ Schema applied successfully");
    return pool.end();
  })
  .catch((err) => {
    console.error("❌ Failed to apply schema:", err);
    process.exit(1);
  });
