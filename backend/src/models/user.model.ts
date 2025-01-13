import { Schema, model } from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

export type TUser = {
    username: string
    email: string
    fullName: string
    avatar: string
    coverImage: string
    watchHistory: string[]
    password: string
    refreshToken: string
    isModified: (field: string) => boolean
    isPasswordCorrect: (password: string) => Promise<boolean>
    generateAccessToken: () => string
    generateRefreshToken: () => string
}

const userSchema = new Schema<TUser>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
            minlength: [6, 'username must be atleast 6 characters long']
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String,
            required: true
        },
        coverImage: {
            type: String
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Video'
            }
        ],
        password: {
            type: String,
            required: true,
            minlength: [8, 'password must be atleast 8 characters long']
        },
        refreshToken: {
            type: String
        }
    },
    { timestamps: true }
)

userSchema.pre<TUser>('save', async function (next) {
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET as string,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY as string
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET as string,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY as string
        }
    )
}

export const User = model<TUser>('User', userSchema)
