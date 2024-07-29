import mongoose from "mongoose";
import dotenv from "dotenv";
import { DB_NAME } from "../constants.js";
import { Story } from "../models/story.model.js";
import { Story_Like } from "../models/story_like.model.js";
import { Story_View } from "../models/story_view.model.js";

dotenv.config(
    {path:'./.env'}
);

export const connectDB = async () => {
    try {
      const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });

      mongoose.connection.once('open', () => {
        console.log('Connected to MongoDB');
      
        // Ensure indexes are created
        Story.createIndexes().then(() => {
          console.log('Indexes created');
        }).catch(err => {
          console.error('Error creating indexes:', err);
        });
        Story_Like.createIndexes().then(() => {
          console.log('Indexes created');
        }).catch(err => {
          console.error('Error creating indexes:', err);
        });
        Story_View.createIndexes().then(() => {
          console.log('Indexes created');
        }).catch(err => {
          console.error('Error creating indexes:', err);
        });
      });
      console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
      console.log("MONGODB connection FAILED ", error);
      process.exit(1);
    }
};