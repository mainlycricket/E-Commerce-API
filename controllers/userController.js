const UserModel = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const { attachCookiesToResponse, createTokenUser, checkPermissions } = require('../utils')

const getAllUsers = async (req, res) => {

    const users = await UserModel.find({ role: 'user' }).select('-password')
    res.status(StatusCodes.OK).json({ users })

}

const getSingleUser = async (req, res) => {

    const id = req.params.id

    const user = await UserModel.findById(id).select('-password')

    if (!user) {
        throw new CustomError.NotFoundError(`No user with id ${id} exists`)
    }

    checkPermissions(req.user, user._id)

    res.status(StatusCodes.OK).json({ user })

}

const showCurrentUser = async (req, res) => {
    res.status(StatusCodes.OK).json({ user: req.user })
}

const updateUser = async (req, res) => {

    const { name, email } = req.body

    if (!name || !name.trim() || !email || !email.trim()) {
        throw new CustomError.BadRequestError("Please give both details")
    }

    const id = req.user.userId

    const updatedUser = await UserModel.findOneAndUpdate({ _id: id }, { name, email }, { new: true, runValidators: true })

    const tokenUser = createTokenUser(updatedUser)
    attachCookiesToResponse({ res, tokenUser })

    res.status(StatusCodes.OK).json(updatedUser)

}

const updateUserPassword = async (req, res) => {

    const { oldPassword, newPassword } = req.body

    if (!oldPassword || !newPassword) {
        throw new CustomError.BadRequestError("Give all details")
    }

    const user = await UserModel.findById(req.user.userId)
    const isPasswordCorrect = await user.comparePassword(oldPassword)

    if (!isPasswordCorrect) {
        throw new CustomError.UnauthenticatedError("Invalid Credentials")
    }

    user.password = newPassword

    await user.save()

    res.status(StatusCodes.OK).json({ msg: 'Success! Password updated' })

}

module.exports = {
    getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword
}