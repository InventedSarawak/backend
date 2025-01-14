import fs from 'fs'
import path from 'path'

export const deleteFileExceptKeep = () => {
    const folderPath = './public/temp/' // Folder path to read
    const fileToKeep = '.gitkeep' // File to keep

    // Read the directory
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err)
            return
        }

        // Loop through files and delete all except the one to keep
        files.forEach((file) => {
            if (file !== fileToKeep) {
                const filePath = path.join(folderPath, file)
                fs.unlink(filePath, (unlinkErr) => {
                    if (unlinkErr) {
                        console.error('Error deleting file:', unlinkErr)
                    } else {
                        console.log(`Deleted file: ${file}`)
                    }
                })
            }
        })
    })
}
