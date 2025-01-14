import { ApiError } from '../utils/ApiError'
import { ApiResponse } from '../utils/ApiResponse'
import { asyncHandler } from '../utils/AsyncHandle'
import { Request, Response } from 'express'
import { User } from '../models/user.model'
import { uploadOnCloudinary } from '../utils/Cloudinary'
import { userFieldRequest } from '../middlewares/auth.middleware'
import { deleteFileExceptKeep } from '../utils/DeleteFileExceptKeep'

const generateAccessAndRefreshToken = async (
    userID: string
): Promise<{ refreshToken: string; accessToken: string }> => {
    try {
        const currentUser = await User.findById(userID)
        if (!currentUser) throw new ApiError(500, 'Internal Server Error')
        const accessToken = currentUser?.generateAccessToken()
        const refreshToken = currentUser?.generateRefreshToken()
        currentUser.refreshToken = refreshToken as string
        await currentUser.save({ validateBeforeSave: false })
        return { refreshToken, accessToken }
    } catch (error) {
        throw new ApiError(500, 'Something went wrong while generating refresh and access token')
    }
}

const registerUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Getting User Data
    const { fullName, username, email, password } = req.body

    // Validation
    // if (fullName === '') throw new ApiError(400, 'User Name cannot be empty', )
    // this will iterate over the array with the if ignoring the null case and will throw error if any one field is an empty string
    if ([fullName, email, username, password].some((field) => field?.trim() === ''))
        throw new ApiError(400, 'All fields are required')
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) throw new ApiError(400, 'Enter valid email', deleteFileExceptKeep)
    if (username.length < 6) throw new ApiError(400, 'Username must be at least 6 alphabets', deleteFileExceptKeep)
    if (password.length < 8) throw new ApiError(400, 'Password must be at least 8 characters long', deleteFileExceptKeep)

    // Check if already exists and stuff based on email and username
    const existedUser = await User.findOne({ $or: [{ username }, { email }] })
    if (existedUser) throw new ApiError(409, 'User with email or username already exists', deleteFileExceptKeep)

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

const loginUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Getting User Data
    const { username, email, password } = req.body
    if (!(username || email)) throw new ApiError(400, 'Email or Username is required')

    // Check if user exists else redirect to register
    const existedUser = await User.findOne({ $or: [{ email }, { username: username.toLowerCase() }] })
    if (!existedUser) throw new ApiError(404, 'User does not exist')

    // Check password
    const isPasswordCorrect = await existedUser.isPasswordCorrect(password)
    if (!isPasswordCorrect) throw new ApiError(401, 'Invalid User Credentials')

    // Send access and refresh Tokens through cookies
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(existedUser._id.toString())
    const loggedInUser = await User.findById(existedUser._id).select('-password -refreshToken')
    const options = { httpOnly: true, secure: true }

    res.status(200)
        .cookie('accessToken', options)
        .cookie('refreshToken', options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                'User logged in successfully'
            )
        )
})

const logoutUser = asyncHandler(async (req: userFieldRequest, res: Response): Promise<void> => {
    await User.findByIdAndUpdate(req.user?._id, { $set: { refreshToken: undefined } })
    const options = { httpOnly: true, secure: true }
    res.status(200)
        .clearCookie('accessToken', options)
        .clearCookie('refreshToken', options)
        .json(new ApiResponse(200, {}, 'User logged Out Successfully'))
})

export { registerUser, loginUser, logoutUser }
