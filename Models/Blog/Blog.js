const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema(
  {
    //id: Number,
    title: String,
    images: [
      {
        imageUrl: String,
        caption: String,
      },
    ],
    date: { type: Date },
  },
  { timestamps: true }
);

BlogSchema.methods.setBlog = function (blog) {
  this.id = blog.id;
  this.title = blog.title;
  this.images = blog.images;
  this.date = blog.date;
};

const Blog = mongoose.model("blogs", BlogSchema, "blogs");
module.exports = Blog;
