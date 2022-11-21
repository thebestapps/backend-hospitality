const mongoose = require("mongoose");

const PropertySchema = new mongoose.Schema(
  {
    name: { type: String, default: null },
    urlName: String,
    logo: { type: String, default: null },
    cover: { type: String, default: null },
    slogan: { type: String, default: null },
    about: { type: String, default: null },
    mainColor: { type: String, default: null },
    accentColor: { type: String, default: null },
    hasBar: { type: Boolean, default: false },
    isBookableBar: { type: Boolean, default: false },
    //rooms: [String],
    //highlights: [String],
    highlights: [{ type: mongoose.Types.ObjectId, ref: "highlights" }],
    amenities: [{ type: mongoose.Types.ObjectId, ref: "amenities" }],
    barName: { type: String, default: null },
    barImg: { type: String, default: null },
    barDesc: { type: String, default: null },
    barMenu: { type: String, default: null },
    events: [{ type: mongoose.Types.ObjectId, ref: "events" }],
    //events: [
    //  {
    //    img: String,
    //    title: String,
    //  },
    //],
    deleted: { type: Boolean, default: false },
    // experiences: [{
    //     img: String,
    //     title: String
    // }],
  },
  { timestamps: true }
);

PropertySchema.methods.setGuesthouse = function (guesthouse) {
  this.name = guesthouse.name;
  this.urlName = guesthouse.urlName;
  this.logo = guesthouse.logo;
  this.largeImgUrl = guesthouse.largeImgUrl;
  this.slogan = guesthouse.slogan;
  this.about = guesthouse.about;
  this.mainColor = guesthouse.mainColor;
  this.accentColor = guesthouse.accentColor;
  this.rooms = guesthouse.rooms;
  this.highlights = guesthouse.highlights;
  this.hasBar = guesthouse.hasBar;
  this.isBookableBar = guesthouse.isBookableBar;
  this.barName = guesthouse.barName;
  this.barImg = guesthouse.barImg;
  this.barDesc = guesthouse.barDesc;
  this.barMenu = guesthouse.barMenu;
  this.events = guesthouse.events;
  this.experiences = guesthouse.experiences;
};

const Property = mongoose.model("guesthouses", PropertySchema, "guesthouses");
module.exports = Property;
