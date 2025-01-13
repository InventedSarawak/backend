import { Schema, model } from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'
import { TUser } from './user.model'

export type TVideo = {
    videoFile: string
    thumbnail: string
    title: string
    description: string
    duration: number
    views: number
    isPublished: boolean
    owner: TUser
    plugin: () => void
}

const videoSchema = new Schema<TVideo>(
    {
        videoFile: {
            type: String,
            required: true
        },
        thumbnail: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        duration: {
            type: Number,
            required: true
        },
        views: {
            type: Number,
            default: 0,
            required: true
        },
        isPublished: {
            type: Boolean,
            default: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    { timestamps: true }
)

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = model<TVideo>('Video', videoSchema)
