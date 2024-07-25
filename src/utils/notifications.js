import { Notification } from "../models/notification.model";

const followNotification = async (userId, message, type) => {
    const notification = new Notification({
      userId,
      message,
      type
    });
    await notification.save();
};

export {followNotification};