const router = require('express').Router()
const { authenticateUser, authorizePersmissions } = require('../middleware/authentication')

const { getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword } = require('../controllers/userController')

router.route('/').get(authenticateUser, authorizePersmissions('admin', 'owner'), getAllUsers)

router.route('/showMe').get(authenticateUser, showCurrentUser)
router.route('/updateUser').patch(authenticateUser, updateUser)
router.route('/updateUserPassword').patch(authenticateUser, updateUserPassword)

router.route('/:id').get(authenticateUser, authorizePersmissions('admin', 'user'), getSingleUser)

module.exports = router