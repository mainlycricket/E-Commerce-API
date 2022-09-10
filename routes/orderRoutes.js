const router = require('express').Router()

const {
    getAllOrders,
    getSingleOrder,
    getCurrentUserOrders,
    createOrder,
    updateOrder
} = require('../controllers/orderController')

const { authenticateUser, authorizePersmissions } = require('../middleware/authentication')

router.route('/')
    .get(authenticateUser, authorizePersmissions('admin'), getAllOrders)
    .post(authenticateUser, createOrder)

router.route('/showAllMyOrders').get(authenticateUser, getCurrentUserOrders)

router.route('/:id')
    .get(authenticateUser, getSingleOrder)
    .patch(authenticateUser, updateOrder)

module.exports = router