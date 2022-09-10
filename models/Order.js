const mongoose = require('mongoose');

const SingleOrderItemSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    image: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    product: {
        type: mongoose.Types.ObjectId,
        ref: 'Product',
        required: [true, 'product is required']
    }

})

const OrderSchema = new mongoose.Schema({

    tax: {
        type: Number,
        required: [true, 'Tax is required']
    },

    shippingFee: {
        type: Number,
        required: [true, 'Shipping fee is required']
    },

    subtotal: {
        type: Number,
        required: [true, 'subtotal is required']
    },

    total: {
        type: Number,
        required: [true, 'total is required']
    },

    orderItems: [SingleOrderItemSchema],

    status: {
        type: String,
        enum: ['pending', 'failed', 'paid', 'delivered', 'canceled'],
        default: 'pending'
    },

    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'user is required']
    },

    clientSecret: {
        type: String,
        required: [true, 'clientSecret is required']
    },

    paymentIntentId: {
        type: String
    }

}, { timestamps: true } )

const OrderModel = mongoose.model('Order', OrderSchema)

module.exports = OrderModel