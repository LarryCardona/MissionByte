import pg from "pg";

export const pool = new pg.Pool({
  user: 'postgres',
  host: 'localhost',
  password: '2007',
  database: 'missionbyte',
  port: '5432',
});
