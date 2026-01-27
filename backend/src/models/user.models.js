import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({

    username: {             // for leaderboard names
        type: String,
        required: true,
        trim: true
    },
    email: {                // for signup login
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {              // for signup login
        type: String,
        required: [true, "Password is required"],
    },
    description: {          // for leaderboard or profile
        type: String,
        required: false
    },
    field: {          // for caterogry leaderboard or profile
        type: String,
        trim: true
    },
    totalStudyMinutes: {
        type: Number,
        default: 0
    },
    avatar: {           // for actual photo or default given by system
        type: String,
        required: false
    },
    friends:
        [
            {
                type: Schema.Types.ObjectId,
                ref: "User"
            }
        ],

    isActive: {
        type: Boolean,
        default: true
    }
},
    {
        timestamps: true
    }
);

export const User = mongoose.model("User", userSchema)