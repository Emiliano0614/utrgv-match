function mapStundentProfileRow(row){
    return{
    bio: row.bio,
    classification: row.classification,
    major: row.major
    }
}



function mapBusinessProfileRow(row){
    return{
    projectName: row.project_name,
    industry: row.industry,
    needs: row.needs
    }
}


function FindStudentProfileByUserId(db,user_id){
    const row = db.prepare(`SELECT * FROM stundent_profiles WHERE user_id = ?`).get(user_id)
    if(row == null){
        return null
    }
    return  mapStundentProfileRow(row)
}

function FindBusinessProfileByUserId(db,user_id){
    const row = db.prepare(`SELECT * FROM Business_profile WHERE user_id = ?`).get(user_id)
    if(row == null){
        return null
    }
    return mapBusinessProfileRow(row)
}


function upsertStudentProfile (db,profile){
    //if the profile hasent been created insert on clumns 
    // -- add these values 
    //  VALUES (?,?,?,?,?) 
    // --if the profile already exits
    // ON CONFLICT (user_id)
    // --update VALUES
    //DO UPDATE SET values = EXCLUDED.value `
    const row = db.prepare(`INSERT INTO stundent_profiles (user_id, bio, classification, major) 
        VALUES (?,?,?,?) 
        ON CONFLICT (user_id)
        DO UPDATE SET bio = EXCLUDED.bio ,
        classification = EXCLUDED.classification,
        major = EXCLUDED.major
        `).run(profile.userId, profile.bio, profile.classification, profile.major)


return {
    ok:true
}
}

function upsertBusinessProfile(db,profile){
    const row = db.prepare(`INSERT INTO Business_profile (user_id,project_name,industry,needs)
        VALUES (?,?,?,?)
        ON  CONFLICT (user_id)
        DO UPDATE SET project_name = EXCLUDED.project_name,
        industry = EXCLUDED.industry,
        needs = EXCLUDED.needs
        `).run(profile.userId, profile.projectName, profile.industry, profile.needs)
        return{
            ok: true
        }
}

module.exports = {
    FindStudentProfileByUserId,
    FindBusinessProfileByUserId,
    upsertStudentProfile,
    upsertBusinessProfile
}