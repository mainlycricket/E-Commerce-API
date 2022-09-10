const OrderModel = require('../models/Order')
const ProductModel = require('../models/Product')

const { StatusCodes } = require('http-status-codes')
const CustomAPIError = require('../errors')

const { checkPermissions } = require('../utils')

const fakeStripeAPI = async (amount, currency) => {
    const client_secret = 'someRandomValue'
    return { client_secret, amount }
}

const createOrder = async (req, res) => {

    const { tax, shippingFee, items: cartItems } = req.body

    if (!cartItems || cartItems.length < 1) {
        throw new CustomAPIError.BadRequestError("Cart is empty")
    }

    if (!tax || !shippingFee) {
        throw new CustomAPIError.BadRequestError("Please provide tax and shipping fee")
    }

    let orderItems = []
    let subtotal = 0

    for (let item of cartItems) {

        const dbProduct = await ProductModel.findById(item.product)

        if (!dbProduct) {
            throw new CustomAPIError.NotFoundError(`No product found with id: ${item.product}`)
        }

        const { name, price, image, _id } = dbProduct

        const singleOrderItem = {
            amount: item.amount,
            name,
            price,
            image,
            product: _id
        }

        orderItems.push(singleOrderItem)    // add item to order
        subtotal += item.amount * price  // calculate subtotal

    }

    const total = tax + shippingFee + subtotal  // calculate total

    // get client secret
    const paymentIntent = await fakeStripeAPI({
        amount: total,
        currency: 'usd'
    })

    const newOrder = await OrderModel.create({
        orderItems,
        total,
        subtotal,
        tax,
        shippingFee,
        user: req.user.userId,
        clientSecret: paymentIntent.client_secret,
    })

    res.status(StatusCodes.CREATED).json({ order: newOrder, clientSecret: newOrder.clientSecret })

}

const getAllOrders = async (req, res) => {

    const orders = await OrderModel.find({})

    if (orders.length < 1) {
        throw CustomAPIError.NotFoundError('No orders found')
    }

    res.status(StatusCodes.OK).json({ count: orders.length, orders })

}

const getSingleOrder = async (req, res) => {

    const orderId = req.params.id

    const order = await OrderModel.findById(orderId)

    if (!order) {
        throw new CustomAPIError.NotFoundError(`No order found with id: ${orderId}`)
    }

    checkPermissions(req.user, order.user)

    res.status(StatusCodes.OK).json({ order })

}

const getCurrentUserOrders = async (req, res) => {

    const orders = await OrderModel.find({ user: req.user.userId })

    if (!orders || orders.length < 1) {
        throw new CustomAPIError.NotFoundError(`No orders found for user with id: ${req.user.userId}`)
    }

    res.status(StatusCodes.OK).json({ orders })
}


const updateOrder = async (req, res) => {

    const orderId = req.params.id

    const { paymentIntentId } = req.body

    const order = await OrderModel.findById(orderId)

    if (!order) {
        throw new CustomAPIError.NotFoundError(`No order found with id: ${orderId}`)
    }

    checkPermissions(req.user, order.user)

    order.paymentIntentId = paymentIntentId
    order.status = 'paid'

    await order.save()

    res.status(StatusCodes.OK).json({ order })

}

module.exports = {
    getAllOrders,
    getSingleOrder,
    getCurrentUserOrders,
    createOrder,
    updateOrder
}