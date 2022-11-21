const mongoose = require("mongoose");

const CareerSchema = new mongoose.Schema(
  {
    id: String,
    team: String,
    description: { type: String },
    city: { type: mongoose.Types.ObjectId, ref: "cities" },
    position: { type: String },
    jobType: { type: Number, enum: [0, 1], default: 0 }, //0 is full time 1 is part time
    iconurl: String,
    duties: [{ type: String }],
    profile: [String],
  },
  { timestamps: true }
);

CareerSchema.methods.setCareer = function (career) {
  this.team = career.team;
  this.description = career.description;
  this.position = career.position;
  this.iconurl = career.iconurl;
  this.duties = career.duties;
  this.profile = career.profile;
  this.urlName = career.urlName;
};

const Career = mongoose.model("careers", CareerSchema, "careers");
module.exports = Career;
