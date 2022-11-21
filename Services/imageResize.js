const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const outputFolder = "images/";

module.exports = async (req, res, next) => {
  let files = [];

  const resizePromises = req.files.map(async (file) => {
    await sharp(file.path)
      .resize(2000)
      .jpeg({ quality: 30 })
      .toFile(path.resolve(outputFolder, file.filename + "_full.jpg"));

    fs.unlinkSync(file.path);

    files.push({
      filename: file.filename + "_full.jpg",
      path: path.resolve(outputFolder, file.filename + "_full.jpg"),
    });
  });

  await Promise.all([...resizePromises]);

  req.files = files;

  next();
};
