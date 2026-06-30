
//checks to see if the object or not
const isPlainObject = payload => typeof payload === 'object' && payload !== null && !Array.isArray(payload);

function validateLoginPayload(payload){
  if(!isPlainObject(payload) || !payload.email || !payload.password){
        return {ok: false , code: 'VALIDATION_ERROR'}
    }
    return {ok:true, value: payload}

}

function validateRegistrationPayload(payload){
    if(!isPlainObject(payload) || !payload.email || !payload.fullName || !payload.phone || !payload.password || !payload.role){
        return {ok: false , code: 'VALIDATION_ERROR' }
    }
    return {ok: true , value: payload}

}
module.exports = {
    validateLoginPayload,
    validateRegistrationPayload
}

