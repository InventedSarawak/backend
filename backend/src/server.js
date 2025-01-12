import dotenv from 'dotenv'
import express from 'express'
import connectDB from './db/index.js'

dotenv.config({
    path: './env'
})

connectDB()

// const app = express()

// ;(async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on('error', (error) => {
//             console.log('ERR: ', error)
//             throw error
//         })
//         app.listen(process.env.PORT, () => {
//             console.log(`App listening on port ${process.env.PORT}`)
//         })
//     } catch (err) {
//         console.error('ERROR: ', err)
//         throw err
//     }
// })()
