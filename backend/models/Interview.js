const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true
    },

    candidateName: {
      type: String,
      required: true,
      trim: true
    },

    candidateEmail: {
      type: String,
      required: true,
      trim: true
    },

    interviewerName: {
      type: String,
      required: true,
      trim: true
    },

    interviewDate: {
      type: Date,
      required: true
    },

    interviewTime: {
      type: String,
      required: true
    },

    interviewType: {
      type: String,
      enum: ["Online", "Offline"],
      required: true
    },

    meetingLink: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled"],
      default: "Scheduled"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Interview",
  interviewSchema
);