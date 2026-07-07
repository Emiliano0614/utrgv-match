const express = require('express')
const { loginUser, registerUser } = require('./auth-service')
const { upsertStudentProfile, upsertBusinessProfile } = require('./profile-repository')
const {getDiscoverProfiles,recordswipe,getMatches,getMessages,sendMessage} = require('./match-repository')
const { initilizeDatabase, resolveDbPath } = require('./db')
function createApp(options = {}){
    const dbPath = resolveDbPath(options.dbPath)// creates the path to the db
    const db = initilizeDatabase(dbPath) //uses the path to poit to the db
    const app = express()
    // creates gloabel variavle to use 
    app.locals.db = db // needs so that routes can send the db when calling a function
    app.locals.dbPath = dbPath //dont know

    app.use(express.json())
    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

        if (req.method === 'OPTIONS'){
            return res.status(200).json({ok: true})
        }


        next()

})

    app.post("/register", (req,res) => {
        const payload = req.body //req,body is the payload {email:eme@eme , name: sdas . pass: 12312}
        const db = app.locals.db //from the global veriable
        const result = registerUser(db, payload)
        if(!result.ok){ // register sends a object that sends {ok : false, code: invalied}
            const status = result.code === 'EMAIL_TAKEN' ? 409 : 400 // if the email is taken send 409 else send 400
            return res.status(status).json({ // send back to the front end the code with the object ok and code 
                ok: false,
                code: result.code,
            })
        }
        return res.status(201).json({
            ok: true ,
            user: result.user // registeruser calls crateuer which retuens { ok: true, user: mapUserRow(row) }
        })

    
    }) 
    app.post("/login",(req,res) => {
        const payload = req.body
        const db = app.locals.db
        const result = loginUser(db,payload)
        if(!result.ok){
            const status = result.code === 'INVALID_CREDENTIALS' ? 401 : 400
            return res.status(status).json({
                ok: false,
                code : result.code
            })
        }
        //sends to the front end the user and the user profile becasue it calls getStudentProfile 
        return res.status(200).json({
            ok: true,
            user: result.user // from the loginuser already adds the progile to ehe user it retuen { ...account.user, ...profile } 
        })
    })

    //jusst posts or updates the studets profile 
    app.post("/profile/student", (req,res) =>{
        const payload = req.body
        const db = app.locals.db
        //checks if the payload comes with some of the stuff dosent check if it comes with bio beacuse its optional based on the sql it can be null
        if(!payload.userId || !payload.major || !payload.classification){
            return res.status(400).json({ok: false , code :  'VALIDATION_ERROR'})
        }
        const result = upsertStudentProfile(db,payload)
        return res.status(200).json({
            ok: true
        })
    })
    //jusst posts or updates the bussiness profile 
    app.post("/profile/business", (req,res) => {
        const payload = req.body
        const db = app.locals.db
        //checks if the payload comes with stuff ot dosent check if it comes with needs beacuse its optional based on the sql it can be null
        if(!payload.userId || !payload.industry?.trim()){
            return res.status(400).json({ok: false, code: 'VALIDATION_ERROR'})
        }
        const result = upsertBusinessProfile(db,payload)
        return res.status(200).json({
            ok: true
        })
    })

    app.get("/discover/:userId", (req,res) =>{
        const db = app.locals.db
        const userId = req.params.userId
        if(isNaN(Number(userId)) || Number(userId) == 0){
            return res.status(400).json({ok: false, code: 'VALIDATION_ERROR'})
        }
        const result = getDiscoverProfiles(db,userId)
        return res.status(200).json({
            ok: true,
            //result comes with the profiles
            profiles: result
        })
    })

    // SWIPES TABLE
// | id | swiper_id | swiped_id | liked |
// |----|-----------|-----------|-------|
// | 1  | 1         | 2         | 1     |  ← user 1 liked user 2
// | 2  | 2         | 1         | 1     |  ← user 2 liked user 1 back = match created
// | 3  | 1         | 3         | 0     |  ← user 1 passed on user 3

    app.post("/swipe", (req,res) =>{
        const db = app.locals.db
        const swiperId = req.body.swiper_id
        const swipedId = req.body.swiped_id
        const liked = req.body.liked ? 1 : 0
        if(!swipedId || !swiperId || req.body.liked === undefined){
            return res.status(400).json({
                ok:false,
                message: "invalide payload"
            })
        }
        const result = recordswipe(db,swiperId,swipedId,liked)
        
        return res.status(200).json({ ok: true, matched: result.matched })
    })

    // MATCHES TABLE (created when row 2 in swipes was inserted)
// | id | user1_id | user2_id |
// |----|----------|----------|
// | 1  | 1        | 2        |  ← smaller id first always
    app.get("/matches/:userId", (req,res)=>{
        const db = app.locals.db
        const userId = req.params.userId
        if(isNaN(Number(userId)) || Number(userId) == 0){
            return res.status(400).json({ok: false, code: 'VALIDATION_ERROR'})
        }
        const result = getMatches(db,userId)
        return res.status(200).json({
            ok: true,
            //result comes with the other users profile 
            matches: result
        })
    })

    // MESSAGES TABLE (user 1 and 2 chatting via match_id 1)
// | id | match_id | sender_id | content      | created_at          |
// |----|----------|-----------|--------------|---------------------|
// | 1  | 1        | 1         | "hey!"       | 2026-06-17 10:00:00 |
// | 2  | 1        | 2         | "whats up"   | 2026-06-17 10:01:00 |
// | 3  | 1        | 1         | "nm you?"    | 2026-06-17 10:02:00 |
    app.get("/messages/:matchId", (req,res) => {
        const db = app.locals.db
        const matchId = req.params.matchId
        if(isNaN(Number(matchId)) || Number(matchId) == 0){
            return res.status(400).json({ok: false, code: 'VALIDATION_ERROR'})
        }
        const result = getMessages(db,matchId)
        return res.status(200).json({
            ok: true,
            //comes with all the messahes between does 2 users
            messages: result
        })
    })


    app.post("/messages", (req,res) => {
        const db = app.locals.db
        const matchId = req.body.match_id
        const senderId = req.body.sender_id
        const content = req.body.content
        if(!matchId || !senderId || !content){
            return res.status(400).json({
                ok:false,
                message: "invalide payload"
            })
        }
        const result = sendMessage(db, matchId, senderId,content)
        return res.status(201).json({ ok: true, message: result }) 
    })
        

    
    app.use((error, _req,res,next) => {
        if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
            return res.status(400).json({
                ok: false,
                code: 'VALIDATION_ERROR',
            })
        }

        return next(error)
    })

    app.use((_req,res) => {
        res.status(404).json({ok : false, code: 'NOT_FOUND'})
    })






    return app
}



module.exports = createApp