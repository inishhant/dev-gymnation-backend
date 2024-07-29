import cron from 'node-cron';
import mongoose from 'mongoose';
import { Story } from './models/story';
import { User } from './models/user';

// Function to clean up expired stories
async function cleanupExpiredStories() {
  try {
    const expiredStories = await Story.find({ createdAt: { $lte: new Date(Date.now() - 80 * 1000) } });
    const all_users = await User.find({});

    for (const story of expiredStories) {
      await User.findByIdAndUpdate(
        story.user,
        { $pull: { stories: story._id } }
      );
      await story.remove();
      console.log(`Story Id: ${story._id} removed from user ${story.user}.`);
    }
  } catch (err) {
    console.error('Error cleaning up expired stories:', err);
  }
}

// Schedule the cleanup job to run every hour
cron.schedule('* * * * *', () => {
  console.log('Running cleanup job...');
  cleanupExpiredStories();
});
