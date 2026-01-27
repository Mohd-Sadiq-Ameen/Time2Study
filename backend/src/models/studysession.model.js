import mongoose, { Schema } from "mongoose";

const StudySessionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    durationMinutes: {
        type: Number,
        required: true
    },

    date: {
        type: Date,
        required: true
    },

    source: {
        type: String,
        enum: ["upload", "youtube"],
        required: true
    },

    sourceRef: {
        type: String
        // video filename OR youtube link
    }

}, { timestamps: true });


export const StudySession = mongoose.model('StudySession', StudySessionSchema)
