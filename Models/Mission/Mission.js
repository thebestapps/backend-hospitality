const mongoose = require("mongoose");

const MissionSchema = new mongoose.Schema(
  {
    mission: { type: String, required: true },
    mission_id: { type: String, required: true },
    image: { type: String, required: true },
  },
  { timestamps: true }
);

const Mission = mongoose.model("mission", MissionSchema, "mission");
module.exports = Mission;
