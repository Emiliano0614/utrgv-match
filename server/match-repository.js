function mapDiscoverRow(row) {
    return {
        id: row.id,
        fullName: row.full_name,
        role: row.role,
        bio: row.bio,
        major: row.major,
        classification: row.classification,
        projectName: row.project_name,
        industry: row.industry,
        needs: row.needs
    }
}
function mapMatchRow(row) {
    return {
        matchId: row.match_id,
        fullName: row.full_name,
        role: row.role,
        bio: row.bio,
        major: row.major,
        classification: row.classification,
        projectName: row.project_name,
        industry: row.industry,
        needs: row.needs,
        user1Id: row.user1_id,
        user2Id: row.user2_id
    }
}

async function getDiscoverProfiles(db, userid) {
    const { rows: userRows } = await db.query(`SELECT role FROM users WHERE id = $1`, [userid])
    const user = userRows[0]
    let oppositeRole
    if (user.role === 'student') {
        oppositeRole = 'business'
    }
    else {
        oppositeRole = 'student'
    }
    // I need to get profiles from the opposite role to show in the discovery page
    // users table has the basic info (id, full_name, role)
    // stundent_profiles and Business_profile have the extra profile info
    // LEFT JOIN merges them — it keeps ALL rows from users even if there is no matching
    // row in the profile table (business users wont have a row in stundent_profiles so those
    // columns just come back as NULL and vice versa)
    // the foreign key (user_id) is what LEFT JOIN uses to connect the tables —
    // it says "find the row in stundent_profiles where stundent_profiles.user_id = users.id"
    // same for Business_profile
    // WHERE role = $1 — only return users with the opposite role
    // AND users.id != $2 — exclude the current user so they dont see themselves
    // AND users.id NOT IN (...) — subquery that gets all the ids the current user
    // already swiped on (liked or passed) from the swipes table, then excludes them
    const { rows } = await db.query(
        `SELECT users.id, full_name, major, classification, bio, project_name, industry, needs
         FROM users
         LEFT JOIN stundent_profiles ON stundent_profiles.user_id = users.id
         LEFT JOIN Business_profile ON Business_profile.user_id = users.id
         WHERE role = $1
           AND users.id != $2
           AND users.id NOT IN (SELECT swiped_id FROM swipes WHERE swiper_id = $3)`,
        [oppositeRole, userid, userid]
    )
    // rows is an array of raw rows from postgres with snake_case column names
    // ex: [{ id: 2, full_name: 'John', project_name: 'App', ... }, { id: 5, full_name: 'Sara', ... }]
    // .map() loops over every row and runs mapDiscoverRow on each one to get clean camelCase objects
    return rows.map(row => mapDiscoverRow(row))
}


async function recordswipe(db, swiperId, swipedId, liked) {
    // insert a new row into swipes recording who swiped on who and if they liked them
    // ON CONFLICT DO NOTHING so that if the same pair already exists it wont crash (UNIQUE constraint)
    // this is postgres's equivalent of sqlite's "INSERT OR IGNORE"
    await db.query(
        `INSERT INTO swipes (swiper_id, swiped_id, liked)
         VALUES ($1, $2, $3)
         ON CONFLICT (swiper_id, swiped_id) DO NOTHING`,
        [swiperId, swipedId, liked]
    )

    let match
    // only check for a mutual like if the current user liked the other person
    // no point checking if they passed
    if (liked === true) {
        // check if the other person (swipedId) already liked the current user (swiperId) back
        // swiper_id = swipedId — they are the one who swiped
        // swiped_id = swiperId — they swiped on the current user
        // if this returns a row it means both users liked each other = match
        const { rows } = await db.query(
            `SELECT id FROM swipes WHERE
                swiper_id = $1
                AND swiped_id = $2
                AND liked = true`,
            [swipedId, swiperId]
        )
        match = rows[0]
    }

    if (match) {
        // smaller id always goes in user1_id, keeps the UNIQUE(user1_id, user2_id) pair consistent
        // no matter which of the two users swiped last
        const [user1Id, user2Id] = swipedId < swiperId ? [swipedId, swiperId] : [swiperId, swipedId]
        await db.query(
            `INSERT INTO matches (user1_id, user2_id)
             VALUES ($1, $2)
             ON CONFLICT (user1_id, user2_id) DO NOTHING`,
            [user1Id, user2Id]
        )
        return { matched: true }
    }
    return { matched: false }
}

//this function gets the matches from the user and also gets the info from does mathces
//im order to know what colunm  userid is in check both clumns then  the other cloumn is the other user
// if the current user is user1_id, give me user2_id (the other person), otherwise give me user1_id
async function getMatches(db, userId) {
    const { rows } = await db.query(
        `SELECT matches.id as match_id, full_name, major, classification, bio, project_name, industry, needs, user1_id, user2_id
         FROM matches
         JOIN users ON (CASE WHEN user1_id = $1 THEN user2_id ELSE user1_id END) = users.id
         LEFT JOIN stundent_profiles ON stundent_profiles.user_id = users.id
         LEFT JOIN Business_profile ON Business_profile.user_id = users.id
         WHERE user1_id = $2 OR user2_id = $3`,
        [userId, userId, userId]
    )

    return rows.map(row => mapMatchRow(row))
}


async function getMessages(db, matchid) {
    // gets all messages for a specific match/conversation
    // match_id is used to filter — not id, because id is the message's own unique id
    // ORDER BY created_at ASC so messages come back oldest to newest (top to bottom in chat)
    const { rows } = await db.query(
        `SELECT * FROM messages
         WHERE match_id = $1
         ORDER BY created_at ASC`,
        [matchid]
    )
    return rows
}
//insert the meesage in messages with the
// match id so that we knwo which users is that message from
// RETURNING id gives us the new message's id in the same round trip
async function sendMessage(db, matchId, senderId, content) {
    const { rows } = await db.query(
        `INSERT INTO messages (match_id, sender_id, content)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [matchId, senderId, content]
    )
    return {
        id: rows[0].id,
        matchId,
        senderId,
        content
    }
}

module.exports = {
    getDiscoverProfiles,
    recordswipe,
    getMatches,
    getMessages,
    sendMessage
}
