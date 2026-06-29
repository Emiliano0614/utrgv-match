const Database = require("better-sqlite3")
const fs = require('node:fs')
const path = require('node:path')

//creates a path to the data base gile .local is a folder auth,db is the 
//actual file with the data
const DEFAULT_DB_PATH = path.join(__dirname, '.local', 'auth.db')

//for testing If overridePath was passed in (like during testing), use that
 //If not, check if there's an AUTH_DB_PATH environment variable set, use that
 //If neither of those exist, fall back to DEFAULT_DB_PATH which is the default .local/auth.db path
function resolveDbPath(overridePath) {
  return overridePath || process.env.AUTH_DB_PATH || DEFAULT_DB_PATH
}
// the reson for a function is so that you can use diffrent database to test it 
function  initilizeDatabase(dbPath){

// makes sure that the .local folder actully exits if not creates it and
// return ture so it dosnet crash
fs.mkdirSync(path.dirname(dbPath), { recursive: true })
const db = new Database(dbPath)// open files or crates it if dosent exists

// cretes table if does not exists email needs to be unique Phone is optional
db.exec(`
    CREATE TABLE IF NOT EXISTS users( 
        id INTEGER PRIMARY  KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        phone TEXT NOT NULL ,
        role TEXT NOT NULL
)
`)


// cretes table if does not exists it needs to be the same is  the user id 
// to get everthing from the user including its user and profile
//bio its optional
db.exec(`
    CREATE TABLE IF NOT EXISTS stundent_profiles (
        id INTEGER PRIMARY  KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL  UNIQUE, 
        bio TEXT,
        classification TEXT NOT NULL,
        major TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
)
`)



// cretes table if does not exists it needs to be the same is  the user id 
// to get everthing from the user including its user and profile
// needs is optinal 
db.exec(`
    CREATE TABLE IF NOT EXISTS Business_profile(
        id INTEGER PRIMARY  KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL  UNIQUE,
        project_name TEXT NOT NULL,
        industry  TEXT NOT NULL,
        needs TEXT,
        FOREIGN KEY (user_id) REFERENCES  users(id)
        )
`)
    

// the row is created when the user swipes 
//swiper id and swiped id need to be unique so that they dont repeat 
//like id bool beacuse like = true false = swiped  
db.exec(`
    CREATE TABLE IF NOT EXISTS swipes(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    swiper_id INTEGER NOT NULL  ,
    swiped_id  INTEGER NOT NULL  ,
    liked BOOLEAN NOT NULL,
    UNIQUE(swiper_id,swiped_id) ,
    FOREIGN KEY (swiper_id)  REFERENCES  users(id),
    FOREIGN KEY (swiped_id)  REFERENCES  users(id)
    )
    `)

//ceates row when there is a matach 
//unique is needed so that it dosnent create diffrent roes whith the same users
db.exec(`
    CREATE TABLE IF NOT EXISTS matches(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user1_id INTEGER NOT NULL,
    user2_id INTEGER NOT NULL,
    UNIQUE(user1_id, user2_id),
    FOREIGN KEY (user1_id)  REFERENCES  users(id),
    FOREIGN KEY (user2_id)  REFERENCES  users(id)
    )
    `)

//every time a message is sent it cretes a new row
//match id is for look for that conversation between thoise users
//sender id the one who is seednding the message
//crated at is for know what message was sent first 
db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (match_id) REFERENCES matches(id),
      FOREIGN KEY (sender_id) REFERENCES users(id)
    ) 
    `)
 return db
}
module.exports = {
    DEFAULT_DB_PATH,
    initilizeDatabase,
    resolveDbPath
}
