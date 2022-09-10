const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({

    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Product rating is required']
    },

    title: {
        type: String,
        required: [true, 'Review title is required'],
        trim: true,
        maxlength: [100, 'Review title can\'t be greater than 100 characters']
    },

    comment: {
        type: String,
        required: [true, 'Review comment is required'],
        trim: true
    },

    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },

    product: {
        type: mongoose.Types.ObjectId,
        ref: 'Product',
        required: true
    }

}, { timestamps: true })

ReviewSchema.index({ product: 1, user: 1 }, { unique: true })

ReviewSchema.statics.calculateAverageRating = async function (productId) {

    const result = await this.aggregate([

        { '$match': { product: productId } },

        {
            '$group': {
                _id: '$product',
                averageRating: { $avg: '$rating' },
                numOfReviews: { $sum: 1 }
            }
        }

    ])

    // console.log(result)

    try {

        await this.model('Product').findOneAndUpdate(
            { _id: productId },
            {
                averageRating: Math.ceil(result[0]?.averageRating || 0),
                numOfReviews: result[0]?.numOfReviews || 0,
            }
        )
        
    } catch (error) {
        console.error(error)
    }

}

ReviewSchema.post('save', async function () {
    await this.constructor.calculateAverageRating(this.product)
})

ReviewSchema.post('remove', async function () {
    await this.constructor.calculateAverageRating(this.product)
})

const ReviewModel = mongoose.model('Review', ReviewSchema)

module.exports = ReviewModel