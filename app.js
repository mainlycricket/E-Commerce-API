require('dotenv').config()
require('express-async-errors')

// express

const express = require('express')
const app = express()

// other packages

// const morgan = require('morgan');
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')

const rateLimiter = require('express-rate-limit')
const helmet = require('helmet')
const xss = require('xss-clean')
const cors = require('cors')
const mongoSanitize = require('express-mongo-sanitize')

// database

const connectDB = require('./db/connect')

// routers

const authRouter = require('./routes/authRoutes')
const userRouter = require('./routes/userRoutes')
const productRouter = require('./routes/productRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const orderRouter = require('./routes/orderRoutes')

// middlewares

const notFoundMiddleware = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')

app.set('trust proxy', 1)

app.use(rateLimiter({
    windowMs: 15 * 60 * 1000,    // ms
    max: 60
}))

app.use(helmet())
app.use(xss())
app.use(cors())
app.use(mongoSanitize())

// app.use(morgan('tiny'))
app.use(express.json()) // access data of req.body
app.use(cookieParser(process.env.JWT_SECRET))

app.use(express.static('./public'))
app.use(fileUpload())

//app.use(express.static('./front-end'))

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/products', productRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/orders', orderRouter)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const PORT = process.env.PORT || 5000

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(PORT, console.log(`app is listening at ${PORT}`))
    } catch (error) {
        console.log('connection failed')
    }
}

start()
