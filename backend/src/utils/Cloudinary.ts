import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
    api_key: process.env.CLOUDINARY_API_KEY as string,
    api_secret: process.env.CLOUDINARY_API_SECRET as string
})

const uploadOnCloudinary = async (localFilePath: string) => {
    try {
        if (!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        })
        console.log('File uploaded successfully', response)
        return response
    } catch (err) {
        fs.unlink(localFilePath, (err) => {
            console.error('Error deleting file:', err)
        })
        return null
    }
}

export { uploadOnCloudinary }
