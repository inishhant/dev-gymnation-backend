import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', required: true
        },
        message: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['followRequest', 'followAccepted', 'followDeclined'],
            required: true
        },
        isRead: {
            type: Boolean,
            default: false
        },
    }
);

export const Notification = mongoose.model('Notification', notificationSchema);
