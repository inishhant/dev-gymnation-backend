import mongoose from "mongoose";

const storyViewSchema = new mongoose.Schema({
    story: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Story",
        required: true,
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    createdAt: { type: Date, default: Date.now, index: { expires: 80 } }
})

export const Story_View = mongoose.model("Story_View", storyViewSchema);