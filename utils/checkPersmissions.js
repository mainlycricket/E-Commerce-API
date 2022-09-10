const CustomError = require('../errors')

const checkPermissions = (requestUser, resourceUserId) => {

    // console.log(requestUser)
    // console.log(`resource user id ${resourceUserId} ${typeof resourceUserId}`)

    if (requestUser.role === 'admin') return;
    if (requestUser.userId === resourceUserId.toString()) return;
    throw new CustomError.UnauthorizedError("not authorized to access this resource")

}

module.exports = { checkPermissions }