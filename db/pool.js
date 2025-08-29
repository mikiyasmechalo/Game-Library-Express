import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

// connection using URI
export default new Pool({
  connectionString: process.env.DB_URL,
});
