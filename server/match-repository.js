function mapDiscoverRow(row){
    return{
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
function mapMatchRow(row){
    return{
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

function getDiscoverProfiles(db,userid){
    const user = db.prepare(`SELECT role FROM users WHERE id = ?`).get(userid)
    let oppositeRole
    if(user.role === 'student'){
        oppositeRole = 'business'
    }
    else{
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
// WHERE role = ? — only return users with the opposite role
// AND users.id != ? — exclude the current user so they dont see themselves
// AND users.id NOT IN (...) — subquery that gets all the ids the current user 
// already swiped on (liked or passed) from the swipes table, then excludes them
// .all() runs the query and returns an array of raw rows
// oppositeRole fills the first ?, userid fills the second ?, userid again fills the third ?
   const profiles = db.prepare(`SELECT users.id,full_name,major, classification, bio,project_name, industry, needs
    FROM users 
    LEFT JOIN stundent_profiles ON stundent_profiles.user_id = users.id
    LEFT JOIN Business_profile ON  Business_profile.user_id = users.id
    WHERE role = ? 
     AND users.id != ?
     AND users.id NOT IN (SELECT swiped_id FROM swipes WHERE swiper_id = ?)
    `).all(oppositeRole,userid,userid)
    // profiles is an array of raw rows from SQLite with snake_case column names
// ex: [{ id: 2, full_name: 'John', project_name: 'App', ... }, { id: 5, full_name: 'Sara', ... }]
// .map() loops over every row in the array and runs mapDiscoverRow on each one
// mapDiscoverRow converts each raw row to a clean camelCase object
// the result is a new array of clean objects ready to send to the frontend
// ex: [{ id: 2, fullName: 'John', projectName: 'App', ... }, { id: 5, fullName: 'Sara', ... }]
    return profiles.map(row => mapDiscoverRow(row))
}   


function recordswipe(db, swiperId, swipedId, liked) {
    // insert a new row into swipes recording who swiped on who and if they liked them
    // INSERT OR IGNORE so that if the same pair already exists it wont crash (UNIQUE constraint)
    const profile = db.prepare(`INSERT OR IGNORE INTO swipes (swiper_id, swiped_id, liked) VALUES (?,?,?)`).run(swiperId, swipedId, liked)
    
    let match;
    // only check for a mutual like if the current user liked the other person
    // no point checking if they passed
    if (liked === 1) {
        // check if the other person (swipedId) already liked the current user (swiperId) back
        // swiper_id = swipedId — they are the one who swiped
        // swiped_id = swiperId — they swiped on the current user
        // if this returns a row it means both users liked each other = match
        match = db.prepare(`SELECT id FROM swipes WHERE 
            swiper_id = ?
            AND swiped_id = ?
            AND liked = 1
        `).get(swipedId, swiperId)
    }
    let user
    if(match){
        if(swipedId < swiperId){
            user = db.prepare(`INSERT OR IGNORE INTO matches (user1_id,user2_id) VALUES (?,?)`).run(swipedId, swiperId)
            return { matched: true }
        }
        else{
            user = db.prepare(`INSERT OR IGNORE INTO matches (user1_id,user2_id) VALUES (?,?)`).run(swiperId, swipedId)
            return { matched: true }
        }
    }
    return { matched: false }

}

//this function gets the matches from the user and also gets the info from does mathces
//im order to know what colunm  userid is in check both clumns then  the other cloumn is the other user
// if the current user is user1_id, give me user2_id (the other person), otherwise give me user1_id
//CASE WHEN user1_i= ? THEN user2_id ELSE user1_id END
//stundent_profiles and Business_profile have the extra profile info
// LEFT JOIN merges them — it keeps ALL rows from users even if there is no matching 
function getMatches(db,userId){
    const matches = db.prepare(`SELECT matches.id as match_id,full_name,major, classification, bio,project_name, industry, needs,user1_id, user2_id
        FROM matches 
        JOIN users ON (CASE WHEN user1_id = ? THEN user2_id ELSE user1_id END) = users.id
        LEFT JOIN stundent_profiles ON stundent_profiles.user_id = users.id
        LEFT JOIN  Business_profile ON  Business_profile.user_id = users.id
        WHERE user1_id = ? OR user2_id = ?
        `).all(userId,userId,userId)

        return matches.map(row => mapMatchRow(row))
}


function getMessages(db,matchid){
    // gets all messages for a specific match/conversation
    // match_id is used to filter — not id, because id is the message's own unique id
    // if we used id we would only get one specific message not the whole conversation
    // ORDER BY created_at ASC so messages come back oldest to newest (top to bottom in chat)
    // returns ALL messages for that match — both sent and received
    // the frontend uses sender_id to decide which side to render each message on
    const message = db.prepare(`SELECT * FROM messages 
        WHERE match_id = ? 
        ORDER BY created_at ASC`).all(matchid)
    return message
}
//insert the meesage in messages with the 
// match i so that we knwo which users is that message from
// the frontend uses sender_id to decide which side to render each message on
// if sender_id matches the logged in user = right side (your message)
// if sender_id is someone else = left side (their message)
function sendMessage(db, matchId, senderId,content){
    const message = db.prepare(`INSERT INTO messages (match_id, sender_id, content) 
    VALUES(?, ?,?) `).run(matchId,senderId,content)
    //The new message's id — the frontend needs this to uniquely identify the message
    // (for things like deleting, editing, or just tracking it in state)
    // after sending, the frontend can immediately show the message on screen using the data you return
    //without needing to call getMessages again to refetch the whole conversation.
    return{id: message.lastInsertRowid, matchId, senderId, content}
}

module.exports = {
    getDiscoverProfiles,
    recordswipe,
    getMatches,
    getMessages,
    sendMessage
}