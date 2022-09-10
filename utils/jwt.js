const jwt = require('jsonwebtoken')

const createJWT = ({ payload }) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_LIFETIME })
    return token
}

const isTokenValid = token => jwt.verify(token, process.env.JWT_SECRET)

const attachCookiesToResponse = ({ res, tokenUser }) => {

    const token = createJWT({payload: tokenUser})

    const oneDay = 24 * 60 * 60 * 1000  // in ms (seconds * 1000)

    res.cookie('token', token, {
        httpOnly: true,
        expires: new Date(Date.now() + oneDay),
        secure: process.env.NODE_ENV === 'production',
        signed: true
    })

    // res.status(201).json({ user: tokenUser })

}

module.exports = { createJWT, isTokenValid, attachCookiesToResponse }