//it turns the it to a object so that it can send it
function mapUserRow(row) {
    return {
        id: row.id,
        email: row.email,
        fullName: row.full_name,
        phone: row.phone,
        role: row.role
    }
}

// postgres uses error code 23505 for unique_violation (sqlite used SQLITE_CONSTRAINT)
function isUniqueEmailViolation(error) {
    return error && error.code === '23505'
}

//uses rows[0] because we're only expecting one row back
async function findUserWithPasswordByEmail(db, email) {
    const { rows } = await db.query(`SELECT * FROM users WHERE email = $1`, [email])
    const row = rows[0]
    if (row == null) {
        return null
    }
    // returns password sepratly becasue you dont wwant to send the
    //pass to the front end
    // so the front end will get
    //{ user: { id, email, fullName, phone, role }, password: '$2b$10$...' }
    return {
        user: mapUserRow(row),
        password: row.password
    }
}
// the auth-service calles the function by giving it
//(db, {
// ...validation.value,
//password: preparePasswordForStorage(validation.value.password),
//the ...validation.value, turn it into
//{ email: '...', fullName: '...', phone: '...', password: '...', role: '...' }
//thats why i can use user.email and stuff
async function createUser(db, user) {
    // need a error handelre because the db only takes in unique emails
    try {
        // RETURNING gives us the inserted row back in one query instead of
        // needing a second SELECT like better-sqlite3's lastInsertRowid did
        const { rows } = await db.query(
            `INSERT INTO users (full_name, email, password, phone, role)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, full_name, email, phone, role`,
            [user.fullName, user.email, user.password, user.phone, user.role]
        )
        return {
            ok: true,
            user: mapUserRow(rows[0])
        }
    }
    catch (error) {
        if (isUniqueEmailViolation(error)) {
            return { ok: false, code: 'EMAIL_TAKEN' }
        }
        throw error
    }
}

module.exports = {
    createUser,
    findUserWithPasswordByEmail
}
