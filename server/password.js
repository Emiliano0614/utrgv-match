const bcrypt = require('bcryptjs')

 
function  preparePasswordForStorage(password) {
    const hashedpassword =  bcrypt.hashSync(password, 10)
    return hashedpassword
}

function  comparePassword(password, accountpassword){
    const match =  bcrypt.compareSync(password,accountpassword)
    if(match){
        return true
    }
    return false
}


module.exports= {
    preparePasswordForStorage,
    comparePassword
}