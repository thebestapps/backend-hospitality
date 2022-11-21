const Email = require("./Email");
const messages = require("../../messages.json");
const mongoose = require("mongoose");
const fs = require("fs");
const { sendByMailGun } = require("../../Services/generalServices");
const CONF = require("../../constants");

async function sendEmail(req, res) {
  let email = new Email(req.body);

  await email.save();

  sendByMailGun(
    CONF.EMAIL,
    `Feedback: ${req.body.subject}`,
    "Feedback",
    null,
    `Email: ${req.body.sender}
      Description: ${req.body.body}
    `
  );

  return res
    .status(200)
    .send({ email: email, message: messages.en.addSuccess });
}

async function getEmails(req, res) {
  let emails = await Email.find();

  return res
    .status(200)
    .send({ emails: emails, message: messages.en.addSuccess });
}

async function getEmailById(req, res) {
  let emailId = mongoose.Types.ObjectId(req.params.id);

  let email = await Email.findOne({ _id: emailId });

  if (!email)
    return res
      .status(404)
      .send({ email: null, message: messages.en.noRecords });

  return res
    .status(200)
    .send({ email: email, message: messages.en.getSuccess });
}

async function deleteEmail(req, res) {
  let emailId = mongoose.Types.ObjectId(req.params.id);

  let email = await Email.findOne({ _id: emailId });

  if (!email)
    return res
      .status(404)
      .send({ email: null, message: messages.en.noRecords });

  let deleted = await Email.findOneAndDelete({ _id: emailId });

  return res.status(200).send({ email: deleted, message: messages.en.deleted });
}

async function sendJobApplication(req, res) {
  let { fullName, email, phoneNumber, jobApplied } = req.body;

  if (!req.file)
    return res.status(400).send({ message: messages.en.missingInfo });

  sendByMailGun(
    "hr@cheezhospitality.com",
    "Job Application",
    `Name: ${fullName}
    Email: ${email}
    Phone: ${phoneNumber}
    Job Applied to: ${jobApplied} 
  `,
    fs.createReadStream(req.file.path)
  );

  fs.unlinkSync(req.file.path);

  return res.status(200).send({ message: messages.en.addSuccess });
}

module.exports = {
  sendEmail,
  getEmails,
  getEmailById,
  deleteEmail,
  sendJobApplication,
};
