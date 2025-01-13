import { ApiError } from '../utils/ApiError'
import { ApiResponse } from '../utils/ApiResponse'
import { asyncHandler } from '../utils/AsyncHandle'
import { Request, Response } from 'express'
import { User } from '../models/user.model'
import { uploadOnCloudinary } from '../utils/Cloudinary'

const registerUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Getting User Data
    const { fullName, username, email, password } = req.body

    // Validation
    // if (fullName === '') throw new ApiError(400, 'User Name cannot be empty', )
    // this will iterate over the array with the if ignoring the null case and will throw error if any one field is an empty string
    if ([fullName, email, username, password].some((field) => field?.trim() === ''))
        throw new ApiError(400, 'All fields are required')
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!(emailRegex).test(email)) throw new ApiError(400, 'Enter valid email')
    if (username.length < 6) throw new ApiError(400, 'Username must be at least 6 alphabets')
    if (password.length < 8) throw new ApiError(400, 'Password must be at least 8 characters long')

    // Check if already exists and stuff based on email and username
    const existedUser = await User.findOne({ $or: [{ username }, { email }] })
    if (existedUser) throw new ApiError(409, 'User with email or username already exists')

    // Check for images and avatar(compulsory)
    let avatarLocalPath = (req.files as { [fieldname: string]: Express.Multer.File[] })?.['avatar']?.[0]?.path
    let coverImageLocalPath = (req.files as { [fieldname: string]: Express.Multer.File[] })?.['coverImage']?.[0]?.path
    if (!avatarLocalPath) throw new ApiError(400, 'Avatar file is required')

    //Upload to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!avatar) throw new ApiError(400, 'Avatar file is required')

    // Add entry to db
    const user = await User.create({
        fullName,
        email,
        username: username.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ''
    })

    // Remove pd and refresh token from response
    const createdUser = await User.findById(user._id).select('-password -refreshToken')

    // Check for user creation
    if (!createdUser) throw new ApiError(500, 'Something went wrong while registering user')

    // return res
    res.status(201).json(new ApiResponse(200, createdUser, 'User registered successfully'))
})

export { registerUser }
