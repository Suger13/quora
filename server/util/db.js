import * as pg from 'pg'
import dotenv from 'dotenv'
dotenv.config()

const { Pool } = pg.default;

const pool = new Pool({
    connectionString : `postgresql://postgres:${process.env.PG_PASSWORD}@localhost:5432/quora`
})

export { pool };