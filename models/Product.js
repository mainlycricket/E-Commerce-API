const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [100, 'Product name can\'t exceed 100 characters']
    },

    price: {
        type: Number,
        required: [true, 'Product price is required'],
        default: 0
    },

    description: {
        type: String,
        required: [true, 'Product description is required'],
        trim: true,
        maxlength: [1000, 'Product description can\'t exceed 100 characters']
    },

    image: {
        type: String,
        default: '/uploads/example.jpeg'
    },

    category: {
        type: String,
        required: [true, 'Product category is required'],
        enum: ['office', 'kitchen', 'bedroom']
    },

    company: {
        type: String,
        required: [true, 'Product company is required'],
        enum: {
            values: ['ikea', 'liddy', 'marcos'],
            message: "{VALUE} is not supported"
        }
    },

    colors: {
        type: [String],
        default: ['#222'],
        required: [true, 'Product color is required'],
    },

    featured: {
        type: Boolean,
        default: false
    },

    freeShipping: {
        type: Boolean,
        default: false
    },

    inventory: {
        type: Number,
        default: 15
    },

    averageRating: {
        type: Number,
        default: 0
    },

    numOfReviews: {
        type: Number,
        default: 0
    },

    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Product user is required']
    }

}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })

ProductSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'product',
    justOne: false,
    // match: { rating: 5 }
})

ProductSchema.pre('remove', async function() {
    await this.model('Review').deleteMany({ product: this._id })
})

const ProductModel = mongoose.model("Product", ProductSchema)

module.exports = ProductModel