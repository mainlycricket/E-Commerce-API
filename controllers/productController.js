const ProductModel = require('../models/Product')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const path = require('path')

const createProduct = async (req, res) => {

    req.body.user = req.user.userId

    // const { name, price, description, image, colors, category, company, inventory, averageRating, featured, freeShipping, user } = req.body

    const newProduct = await ProductModel.create(req.body)

    res.status(StatusCodes.CREATED).json({ product: newProduct })

}

const getAllProducts = async (req, res) => {

    const products = await ProductModel.find({})

    if (!products)
        throw new CustomError.NotFoundError(`No products found`)

    res.status(StatusCodes.OK).json({ count: products.length, products })

}

const getSingleProduct = async (req, res) => {

    const productId = req.params.id

    const product = await ProductModel.findById(productId).populate('reviews')

    if (!product)
        throw new CustomError.NotFoundError(`No product found with id: ${productId}`)

    res.status(StatusCodes.OK).json({ product })

}

const updateProduct = async (req, res) => {

    req.body.user = req.user.userId
    const productId = req.params.id

    const updatedProduct = await ProductModel.findOneAndUpdate({ _id: productId }, req.body, { 
        new: true, runValidators: true })

    if (!updatedProduct) {
        throw new CustomError.NotFoundError(`No product found with id: ${productId}`)
    }

    res.status(StatusCodes.OK).json({product: updatedProduct})

}

const deleteProduct = async (req, res) => {

    const productId = req.params.id

    const product = await ProductModel.findById(productId)

    if (!product) {
        throw new CustomError.NotFoundError(`No product found with id: ${productId}`)
    }

    await product.remove()

    res.status(StatusCodes.OK).json({'msg': 'Product removed!'})

}

const uploadImage = async (req, res) => {

    if (!req.files) {
        throw new CustomError.BadRequestError("Image is required")
    }

    const productImage = req.files.image

    if (! productImage.mimetype.startsWith('image')) {
        throw new CustomError.BadRequestError("Only images are supported")
    }

    const maxsize = 1024 * 1024     // 1 MB

    if (productImage.size > maxsize) {
        throw new CustomError.BadRequestError("Image can't be greater than 1 MB")
    }

    const currentDate = new Date().toJSON().replace(/[-:]/g, '')

    const imagePath = path.join(__dirname, `../public/uploads/${currentDate}-${productImage.name}`)

    await productImage.mv(imagePath)

    res.status(StatusCodes.OK).json({ image: `/uploads/${currentDate}-${productImage.name}` })

}

module.exports = {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    uploadImage
}