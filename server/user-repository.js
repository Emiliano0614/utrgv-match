//it turns the it to a object so that it can send it 
function mapUserRow(row){
    return {
        id: row.id,
        email:row.email,
        fullName: row.full_name,
        phone: row.phone,
        role: row.role
    }
}


function isUniqueEmailViolation(error) {
  return error && typeof error.code === 'string' && error.code.startsWith('SQLITE_CONSTRAINT')
}
//uses .get because where heting one row
function findUserWithPasswordByEmail(db,email){
    const row = db.prepare(`
        SELECT  * FROM users WHERE email = ?
        `).get(email)
        if(row == null){
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
function createUser(db,user){
    // need a error handelre because the db only takes in unique emails
    try{
    //it says insert at users at these columns with this values which is the .run
    const row = db.prepare(`
        INSERT INTO users (full_name , email, password , phone , role) VALUES(?,?,?,?,?)`).run(user.fullName , user.email , user.password   , user.phone , user.role)
    //gets the last row id wich is the new crated user 
    //then seraches the db witch that id
     const rowId =  row.lastInsertRowid
    const Newuser = db.prepare(`SELECT id, full_name , email,phone , role FROM users WHERE id = ? `).get(rowId)
     return {
        ok: true,
        user: mapUserRow(Newuser) 
     }
    }
    catch(error){
        if(isUniqueEmailViolation(error)){
            return { ok: false, code: 'EMAIL_TAKEN' }
        }
        throw error
    }  

    
}

module.exports = {
    createUser,
    findUserWithPasswordByEmail
}