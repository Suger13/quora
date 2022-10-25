import * as pg from 'pg'
import dotenv from 'dotenv'
dotenv.config()

const { Pool } = pg.defaults

export const pool = new Pool({
    connectionString : `postgresql://postgres:${process.env.PGPASSWORD}@localhost:5432/quora`
})