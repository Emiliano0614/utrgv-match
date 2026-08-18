const { Pool } = require('pg')

// local fallback so dev still works without setting DATABASE_URL,
// as long as you have a local postgres running with this db name
const DEFAULT_CONNECTION_STRING = 'postgres://postgres:postgres@localhost:5432/utrgv_match'

// same pattern as before (resolveDbPath) — override wins, then env var, then local default
function resolveConnectionString(override) {
    return override || process.env.DATABASE_URL || DEFAULT_CONNECTION_STRING
}

// managed postgres providers (Render, Neon, etc) require SSL but use
// self-signed certs, so we turn off strict cert checking for those
function needsSSL(connectionString) {
    if (process.env.PGSSL === 'false') return false
    if (process.env.PGSSL === 'true') return true
    return /render\.com|neon\.tech|amazonaws\.com|supabase\.co/.test(connectionString)
}

function createPool(connectionString) {
    return new Pool({
        connectionString,
        ssl: needsSSL(connectionString) ? { rejectUnauthorized: false } : false
    })
}

// creates the tables if they dont exist yet, same schema as the sqlite version
// just with postgres types (SERIAL instead of AUTOINCREMENT, TIMESTAMP instead of TEXT, etc)
async function initializeDatabase(connectionStringOverride) {
    const pool = createPool(resolveConnectionString(connectionStringOverride))

    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            full_name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            phone TEXT NOT NULL,
            role TEXT NOT NULL
        )
    `)

    await pool.query(`
        CREATE TABLE IF NOT EXISTS stundent_profiles (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
            bio TEXT,
            classification TEXT NOT NULL,
            major TEXT NOT NULL
        )
    `)

    await pool.query(`
        CREATE TABLE IF NOT EXISTS Business_profile (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
            project_name TEXT NOT NULL,
            industry TEXT NOT NULL,
            needs TEXT
        )
    `)

    await pool.query(`
        CREATE TABLE IF NOT EXISTS swipes (
            id SERIAL PRIMARY KEY,
            swiper_id INTEGER NOT NULL REFERENCES users(id),
            swiped_id INTEGER NOT NULL REFERENCES users(id),
            liked BOOLEAN NOT NULL,
            UNIQUE(swiper_id, swiped_id)
        )
    `)

    await pool.query(`
        CREATE TABLE IF NOT EXISTS matches (
            id SERIAL PRIMARY KEY,
            user1_id INTEGER NOT NULL REFERENCES users(id),
            user2_id INTEGER NOT NULL REFERENCES users(id),
            UNIQUE(user1_id, user2_id)
        )
    `)

    await pool.query(`
        CREATE TABLE IF NOT EXISTS messages (
            id SERIAL PRIMARY KEY,
            match_id INTEGER NOT NULL REFERENCES matches(id),
            sender_id INTEGER NOT NULL REFERENCES users(id),
            content TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
    `)

    return pool
}

module.exports = {
    DEFAULT_CONNECTION_STRING,
    resolveConnectionString,
    initializeDatabase
}
