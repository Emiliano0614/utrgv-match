const { createUser,findUserWithPasswordByEmail  } = require("./user-repository")
const {FindStudentProfileByUserId,FindBusinessProfileByUserId,upsertStudentProfile,upsertBusinessProfile} = require("./profile-repository")
const { validateLoginPayload,validateRegistrationPayload } = require("./validation")
const {preparePasswordForStorage,comparePassword} = require("./password")

function loginUser(db,payload){
    const validate = validateLoginPayload(payload)
    if(validate.ok == false){
        return {ok: false, code: validate.code}
    }
    const result = findUserWithPasswordByEmail(db, payload.email)
    if(result == null){
        return {
            ok:false,
            code:'INVALID_CREDENTIALS'
        }
    }
    const { user: account, password: storedPassword } = result
    const match = comparePassword(payload.password,storedPassword)
    if(match == false){
        return {ok:false , code:'INVALID_CREDENTIALS'}
    }
     let profile
    if(account.role == "student"){
         profile = FindStudentProfileByUserId(db,account.id)
    }
    else if (account.role == "business"){
         profile = FindBusinessProfileByUserId(db,account.id)
    }
    if (profile == null){
        profile = {}
    }
    //with out dots 
    // { account: { id, email, role... }, profile: { major, bio... } }
    //with dots { id, email, role, major, bio... }
    return{
        ok: true,
        user:{ ...account, ...profile}
    }
}

function registerUser(db,payload){
    const validate = validateRegistrationPayload(payload)
    if(validate.ok == false){
         return {ok: false, code: validate.code}
    }
    // the 3 dotd spread all fields from payload into a new object
// then overwrite the password with the hashed version
    const user = createUser(db, { ...payload, password: preparePasswordForStorage(payload.password) })
    return user
}

module.exports = {
    loginUser,
    registerUser
}