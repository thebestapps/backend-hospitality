const mongoose = require("mongoose");

const StorySchema = new mongoose.Schema(
  {
    story: { type: String, required: true },
    story_id: { type: String, required: true },
    image: { type: String, required: true },
  },
  { timestamps: true }
);

const Story = mongoose.model("story", StorySchema, "story");
module.exports = Story;
