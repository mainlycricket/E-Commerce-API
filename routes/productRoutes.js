const router = require("express").Router()

const { authenticateUser, authorizePersmissions } = require('../middleware/authentication')

const {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    uploadImage
} = require('../controllers/productController')

const { getSingleProductReviews } = require('../controllers/reviewController')

router.route('/')
    .get(getAllProducts)
    .post([authenticateUser, authorizePersmissions('admin')], createProduct)

router.post('/uploadImage', [authenticateUser, authorizePersmissions('admin')], uploadImage)

router.route('/:id')
    .get(getSingleProduct)
    .patch([authenticateUser, authorizePersmissions('admin')], updateProduct)
    .delete([authenticateUser, authorizePersmissions('admin')], deleteProduct)

router.get('/:id/reviews', getSingleProductReviews)

module.exports = router