import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
    api_key: process.env.CLOUDINARY_API_KEY as string,
    api_secret: process.env.CLOUDINARY_API_SECRET as string
})

const uploadOnCloudinary = async (localFilePath: string) => {
    try {
        if (!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, { resource_type: 'auto' })
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        console.error('Error uploading file:', error)
        fs.unlink(localFilePath, (unlinkError) => console.error('Error deleting file:', unlinkError))
        return null
    }
}

export { uploadOnCloudinary }
