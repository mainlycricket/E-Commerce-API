const ReviewModel = require('../models/Review')
const ProductModel = require('../models/Product')

const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const { checkPermissions } = require('../utils')

const createReview = async (req, res) => {

    const productId = req.body.product
    const isProductValid = await ProductModel.findById(productId)

    if (!isProductValid) {
        throw new CustomError.NotFoundError(`No product found with id : ${productId}`)
    }

    const isAlreadySubmitted = await ReviewModel.findOne({ user: req.user.userId, product: productId })

    if (isAlreadySubmitted) {
        throw new CustomError.BadRequestError("Review already submitted")
    }

    req.body.user = req.user.userId

    const newReview = await ReviewModel.create(req.body)

    res.status(StatusCodes.CREATED).json({ review: newReview })

}

const getAllReviews = async (req, res) => {

    const reviews = await ReviewModel.find({}).populate({
        path: 'product',
        select: 'name company price'
    }).populate({
        path: 'user',
        select: 'name'
    })

    if (!reviews)
        throw new CustomError.NotFoundError("Can't find any reviews!")

    res.status(StatusCodes.OK).json({ count: reviews.length, reviews })

}

const getSingleReview = async (req, res) => {

    const reviewId = req.params.id

    const review = await ReviewModel.findById(reviewId)

    if (!review)
        throw new CustomError.NotFoundError(`No review found with ${reviewId}`)

    res.status(StatusCodes.OK).json({ review })

}

const updateReview = async (req, res) => {

    const reviewId = req.params.id
    const { rating, title, comment } = req.body

    const review = await ReviewModel.findById(reviewId)

    if (!review)
        throw new CustomError.NotFoundError(`No review found with ${reviewId}`)

    checkPermissions(req.user, review.user)

    review.rating = rating
    review.title = title
    review.comment = comment

    await review.save()

    res.status(StatusCodes.OK).json({ review })

}

const deleteReview = async (req, res) => {

    const reviewId = req.params.id

    const review = await ReviewModel.findById(reviewId)

    if (!review)
        throw new CustomError.NotFoundError(`No review found with ${reviewId}`)

    checkPermissions(req.user, review.user)

    await review.remove()

    res.status(StatusCodes.OK).json({ msg: 'success! Review removed!' })

}

const getSingleProductReviews = async (req, res) => {

    const productId = req.params.id

    const reviews = await ReviewModel.find({ product: productId }).populate({ 
        path: 'user',
        select: 'name' 
    })

    if (!reviews)
        throw new CustomError.NotFoundError(`No reviews for product with id : ${productId}`)

    res.status(StatusCodes.OK).json({ count: reviews.length, reviews })

}

module.exports = {
    createReview,
    getAllReviews,
    getSingleReview,
    updateReview,
    deleteReview,
    getSingleProductReviews
}