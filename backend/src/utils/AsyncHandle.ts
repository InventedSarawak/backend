import { Request, Response, NextFunction, RequestHandler } from 'express'
const asyncHandler = (requestHandler: RequestHandler) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await requestHandler(req, res, next)
        } catch (error) {
            const statusCode = (error as any)?.code || 500
            const message = (error as Error)?.message || 'Internal Server Error'
            res.status(statusCode).json({
                success: false,
                message
            })
        }
    }
}

export { asyncHandler }
