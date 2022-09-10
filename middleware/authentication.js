const { isTokenValid } = require('../utils')
const CustomError = require('../errors')

const authenticateUser = async (req, res, next) => {

    const token = req.signedCookies.token

    if (!token) {
        throw new CustomError.UnauthenticatedError("Authentication failed")
    }

    try {
        const { userId, name, role } = isTokenValid(token)
        req.user = { userId, name, role }
        next()
    }

    catch (error) {
        throw new CustomError.UnauthenticatedError("Authentication failed")
    }

}

const authorizePersmissions = (...roles) => {

    return (req, res, next) => {
        
        if (! roles.includes(req.user.role)) {
            throw new CustomError.UnauthorizedError("Not authorized to access this resource")
        }
    
        next()

    }

}

module.exports = { authenticateUser, authorizePersmissions }