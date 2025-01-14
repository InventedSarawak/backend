import { ApiError } from '../utils/ApiError'
import { asyncHandler } from '../utils/AsyncHandle'
import { Request, Response, NextFunction } from 'express'
import { User, TUser } from '../models/user.model'
import jwt from 'jsonwebtoken'

export type userFieldRequest = Request & {
    user?: TUser
}

export const verifyJWT = asyncHandler(async (req: userFieldRequest, _res: Response, next: NextFunction) => {
    try {
        const token = (req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '')).toString() as string
        if (!token) throw new ApiError(401, 'Unauthorized Request')
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string)
        const user = await User.findById((decodedToken as jwt.JwtPayload)?._id).select('-password -refreshToken')
        if (!user) throw new ApiError(401, 'Invalid Access Token')
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, (error as Error)?.message || 'Invalid Access Token')
    }
})
