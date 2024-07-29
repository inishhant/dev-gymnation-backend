import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
  story_url: [
    {
      type: String,
      required: true,
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  likes: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Story_Like",
  },
  views: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Story_View",
  },
  createdAt: { type: Date, default: Date.now, index: { expires: 80 } }
});

storySchema.pre('remove', async function (next) {
  try {
    await mongoose.model('User').findByIdAndUpdate(
      this.user,
      { $pull: { stories: this._id } }
    );
    console.log(`Story Id: ${this._id} removed from user ${this.user}.`)
    next();
  } catch (err) {
    next(err);
  }
});


export const Story = mongoose.model("Story", storySchema);
