const UserModel = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const { attachCookiesToResponse, createTokenUser } = require('../utils')
const { create } = require('../models/User')

const register = async (req, res) => {

    const { name, email, password } = req.body

    const emailAlreadyExists = await UserModel.findOne({ email })

    if (emailAlreadyExists) {
        throw new CustomError.BadRequestError("A user with this email already exists")
    }

    // set first user as an admin
    const isFirstAccount = await UserModel.countDocuments({}) === 0
    const role = isFirstAccount ? 'admin' : 'user'

    const newUser = await UserModel.create({ name, email, password, role })

    const tokenUser = createTokenUser(newUser)

    attachCookiesToResponse({ res, tokenUser })

    res.status(StatusCodes.CREATED).json({ user: tokenUser })

}

const login = async (req, res) => {

    const { email, password } = req.body

    if (!email || !password || !email.trim()) {
        throw new CustomError.BadRequestError("Please fill all the details")
    }

    const user = await UserModel.findOne({ email })

    if (!user) {
        throw new CustomError.UnauthenticatedError("Invalid creditianls")
    }

    const isPasswordCorrect = await user.comparePassword(password)

    if (!isPasswordCorrect) {
        throw new CustomError.UnauthenticatedError("Invalid creditianls")
    }

    const tokenUser = createTokenUser(user)
    attachCookiesToResponse({ res, tokenUser })
    res.status(StatusCodes.OK).json({user: tokenUser})

}

const logout = async (req, res) => {

    res.cookie('token', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now())
    })

    res.status(StatusCodes.OK).json({msg: 'user logged out'})
}

module.exports = { register, login, logout }