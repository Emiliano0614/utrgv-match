function mapStundentProfileRow(row) {
    return {
        bio: row.bio,
        classification: row.classification,
        major: row.major
    }
}

function mapBusinessProfileRow(row) {
    return {
        projectName: row.project_name,
        industry: row.industry,
        needs: row.needs
    }
}

async function FindStudentProfileByUserId(db, user_id) {
    const { rows } = await db.query(`SELECT * FROM stundent_profiles WHERE user_id = $1`, [user_id])
    const row = rows[0]
    if (row == null) {
        return null
    }
    return mapStundentProfileRow(row)
}

async function FindBusinessProfileByUserId(db, user_id) {
    const { rows } = await db.query(`SELECT * FROM Business_profile WHERE user_id = $1`, [user_id])
    const row = rows[0]
    if (row == null) {
        return null
    }
    return mapBusinessProfileRow(row)
}

async function upsertStudentProfile(db, profile) {
    //if the profile hasent been created insert on clumns
    // -- add these values
    //  VALUES ($1,$2,$3,$4)
    // --if the profile already exits
    // ON CONFLICT (user_id)
    // --update VALUES
    //DO UPDATE SET values = EXCLUDED.value
    await db.query(
        `INSERT INTO stundent_profiles (user_id, bio, classification, major)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id)
         DO UPDATE SET bio = EXCLUDED.bio,
             classification = EXCLUDED.classification,
             major = EXCLUDED.major`,
        [profile.userId, profile.bio, profile.classification, profile.major]
    )

    return {
        ok: true
    }
}

async function upsertBusinessProfile(db, profile) {
    await db.query(
        `INSERT INTO Business_profile (user_id, project_name, industry, needs)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id)
         DO UPDATE SET project_name = EXCLUDED.project_name,
             industry = EXCLUDED.industry,
             needs = EXCLUDED.needs`,
        [profile.userId, profile.projectName, profile.industry, profile.needs]
    )
    return {
        ok: true
    }
}

module.exports = {
    FindStudentProfileByUserId,
    FindBusinessProfileByUserId,
    upsertStudentProfile,
    upsertBusinessProfile
}
