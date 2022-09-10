const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs');

const UserSchema = mongoose.Schema({

    name: {
        type: String,
        required: [true, 'Username is required'],
        trim: true,
        minlength: 3,
        maxlength: 50
    },

    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: [true, 'Email already used'],
        validate: {
            validator: validator.isEmail,
            message: 'Enter a valid email'
        }
    },

    password: {
        type: String,
        required: [true, 'password is requried'],
        minlength: 6,
        maxlength: 20
    },

    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    }

})

UserSchema.pre('save', async function () {

    if (! this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

UserSchema.methods.comparePassword = async function(candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.password)
    return isMatch
}

const UserModel = mongoose.model('User', UserSchema)

module.exports = UserModel