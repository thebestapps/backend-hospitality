const Blog = require("./Blog");
const messages = require("../../messages.json");
const mongoose = require("mongoose");
const CONF = require("../../constants");
const AWS = require("aws-sdk");
const fs = require("fs");

const url = (folder, picture) => {
  return `https://${CONF.AWS.BUCKET_NAME}.s3.amazonaws.com/${folder}/${picture}`;
};

async function createBlog(req, res) {
  let { captions, title, date } = req.body;
  let images = [];

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  captions = JSON.parse(req.body.captions);

  AWS.config.setPromisesDependency();
  AWS.config.update({
    accessKeyId: CONF.AWS.ID,
    secretAccessKey: CONF.AWS.SECRET,
    region: CONF.AWS.REGION,
  });

  const s3 = new AWS.S3();

  let newBlog = new Blog();

  req.files.forEach((file, index) => {
    let params = {
      ACL: "public-read",
      Bucket: CONF.AWS.BUCKET_NAME,
      Body: fs.createReadStream(file.path),
      Key: `Blogs/${newBlog._id}/${file.filename}`,
    };

    images.push({
      imageUrl: url(`Blogs/${newBlog._id}`, file.filename),
      caption: captions[index], //fixCaptions.caption[index],
    });

    s3.upload(params, async (err, data) => {
      if (err) {
        console.log("Error occured while trying to upload to S3 bucket", err);
        return res.status(500).send({ err: err });
      }

      if (data) {
        fs.unlinkSync(file.path); // Empty temp folder
        console.log(data);
        console.log(file);
      }
    });
  });

  newBlog.images = images;
  newBlog.title = title;

  date ? (newBlog.date = new Date(date)) : (newBlog.date = new Date());

  await newBlog.save();

  return res
    .status(200)
    .send({ newBlog: newBlog, message: messages.en.addSuccess });
}

async function getBlogs(req, res) {
  const blogs = await Blog.find({});

  return res
    .status(200)
    .send({ blogs: blogs, message: messages.en.getSuccess });
}

async function getBlogById(req, res) {
  const blog = await Blog.findOne({
    _id: mongoose.Types.ObjectId(req.params.id),
  });

  if (!blog)
    return res.status(404).send({ blog: null, message: messages.en.noRecords });

  return res.status(200).send({ blog: blog, message: messages.en.getSuccess });
}

async function editBlog(req, res) {
  let { captions, title } = req.body;
  let images = [];

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let blog = await Blog.findOne({
    _id: mongoose.Types.ObjectId(req.params.id),
  });

  if (!blog)
    return res.status(404).send({ blog: null, message: messages.en.noRecords });

  //let fixCaptions = {
  //  caption: captions,
  //};
  //
  //for (const key in fixCaptions) {
  //  const value = fixCaptions[key];
  //  fixCaptions[key] = eval(value);
  //}

  captions = JSON.parse(req.body.captions);

  AWS.config.setPromisesDependency();
  AWS.config.update({
    accessKeyId: CONF.AWS.ID,
    secretAccessKey: CONF.AWS.SECRET,
    region: CONF.AWS.REGION,
  });

  const s3 = new AWS.S3();

  if (req.files.length !== 0) {
    req.files.forEach((file, index) => {
      let params = {
        ACL: "public-read",
        Bucket: CONF.AWS.BUCKET_NAME,
        Body: fs.createReadStream(file.path),
        Key: `Blogs/${blog._id}/${file.filename}`,
      };

      images.push({
        imageUrl: url(`Blogs/${blog._id}`, file.filename),
        caption: captions[index],
      });

      s3.upload(params, async (err, data) => {
        if (err) {
          console.log("Error occured while trying to upload to S3 bucket", err);
          return res.status(500).send({ err: err });
        }

        if (data) {
          fs.unlinkSync(file.path); // Empty temp folder
          console.log(data);
          console.log(file);
        }
      });
    });

    req.body.images = images;
  }

  let updated = await Blog.findOneAndUpdate(
    { _id: req.params.id },
    { $set: req.body },
    { new: true }
  );

  return res
    .status(200)
    .send({ blog: updated, message: messages.en.updateSucces });
}

async function deleteBlog(req, res) {
  let blog = await Blog.findOne({
    _id: mongoose.Types.ObjectId(req.params.id),
  });

  if (!blog)
    return res.status(404).send({ blog: null, message: messages.en.noRecords });

  let deleted = await Blog.findOneAndDelete({
    _id: mongoose.Types.ObjectId(req.params.id),
  });

  return res.status(200).send({ blog: deleted, message: messages.en.deleted });
}

async function editImageForBlog(req, res) {
  let { caption, imageId } = req.body;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let blog = await Blog.findOne({
    _id: mongoose.Types.ObjectId(req.params.id),
  });

  if (!blog)
    return res.status(404).send({ blog: null, message: messages.en.noRecords });

  let image = blog.images.id(imageId);

  if (req.files.length === 0) {
    blog.images.pull(image);
    image.caption = caption;

    blog.images.push(image);

    await blog.save();
  } else {
    blog.images.pull(image);

    image.caption = caption;
    image.imageUrl = url(`Blogs/${blog._id}`, req.files[0].filename);

    blog.images.push(image);

    let params = {
      ACL: "public-read",
      Bucket: CONF.AWS.BUCKET_NAME,
      Body: fs.createReadStream(req.files[0].path),
      Key: `Blogs/${blog._id}/${req.files[0].filename}`,
    };

    AWS.config.setPromisesDependency();
    AWS.config.update({
      accessKeyId: CONF.AWS.ID,
      secretAccessKey: CONF.AWS.SECRET,
      region: CONF.AWS.REGION,
    });

    const s3 = new AWS.S3();

    s3.upload(params, async (err, data) => {
      if (err) {
        console.log("Error occured while trying to upload to S3 bucket", err);
        return res.status(500).send({ err: err });
      }

      if (data) {
        fs.unlinkSync(req.files[0].path); // Empty temp folder
        console.log(data);
        console.log(req.files[0]);
      }
    });
    await blog.save();
  }

  return res
    .status(200)
    .send({ blog: blog, message: messages.en.updateSucces });
}

async function DeleteBlogImage(req, res) {
  let { imageId } = req.body;

  if (req.user.role === 0)
    return res
      .status(401)
      .send({ unAutherized: true, message: messages.en.forbidden });

  let blog = await Blog.findOne({
    _id: mongoose.Types.ObjectId(req.params.id),
  });

  if (!blog)
    return res.status(404).send({ blog: null, message: messages.en.noRecords });

  let image = blog.images.id(imageId);

  if (!image)
    return res
      .status(404)
      .send({ image: null, message: messages.en.noRecords });

  blog.images.pull(image);

  AWS.config.setPromisesDependency();
  AWS.config.update({
    accessKeyId: CONF.AWS.ID,
    secretAccessKey: CONF.AWS.SECRET,
    region: CONF.AWS.REGION,
  });

  const s3 = new AWS.S3();

  s3.deleteObject(
    {
      Bucket: CONF.AWS.BUCKET_NAME,
      Key: image.imageUrl.split(".com/").pop(),
    },
    async (data, err) => {
      if (err) {
        console.log(err);
        return res.status(500).send({ err: err });
      }
      if (data) {
        console.log(data);
      }
    }
  );

  await blog.save();

  return res
    .status(200)
    .send({ blog: blog, message: messages.en.updateSucces });
}

module.exports = {
  createBlog,
  getBlogs,
  getBlogById,
  editBlog,
  deleteBlog,
  editImageForBlog,
  DeleteBlogImage,
};
