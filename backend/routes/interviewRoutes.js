const express = require("express");

const router = express.Router();

const Interview = require("../models/Interview");

// =====================================================
// AUTO UPDATE COMPLETED INTERVIEWS
// =====================================================

async function updateCompletedInterviews() {
  try {
    const now = new Date();

    await Interview.updateMany(
      {
        status: "Scheduled",
        interviewDate: { $lt: now }
      },
      {
        $set: {
          status: "Completed"
        }
      }
    );
  } catch (error) {
    console.error(
      "AUTO STATUS UPDATE ERROR:",
      error.message
    );
  }
}

// =====================================================
// GET ALL INTERVIEWS
// =====================================================

router.get("/", async (req, res) => {
  try {

    // Automatically change past interviews
    // from Scheduled → Completed
    await updateCompletedInterviews();

    const interviews = await Interview
      .find()
      .sort({
        interviewDate: 1
      });

    res.json({
      success: true,
      data: interviews
    });

  } catch (error) {

    console.error(
      "GET ALL ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// =====================================================
// GET SINGLE INTERVIEW
// =====================================================

router.get("/:id", async (req, res) => {
  try {

    await updateCompletedInterviews();

    const interview =
      await Interview.findById(
        req.params.id
      );

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found"
      });
    }

    res.json({
      success: true,
      data: interview
    });

  } catch (error) {

    console.error(
      "GET SINGLE ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// =====================================================
// CREATE INTERVIEW
// =====================================================

router.post("/", async (req, res) => {
  try {

    const interview =
      new Interview({

        companyName:
          req.body.companyName,

        candidateName:
          req.body.candidateName,

        candidateEmail:
          req.body.candidateEmail,

        interviewerName:
          req.body.interviewerName,

        interviewDate:
          req.body.interviewDate,

        interviewTime:
          req.body.interviewTime,

        interviewType:
          req.body.interviewType,

        meetingLink:
          req.body.meetingLink,

        status:
          req.body.status ||
          "Scheduled"
      });

    const savedInterview =
      await interview.save();

    res.status(201).json({
      success: true,

      message:
        "Interview scheduled successfully",

      data:
        savedInterview
    });

  } catch (error) {

    console.error(
      "CREATE ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// =====================================================
// UPDATE INTERVIEW
// =====================================================

router.put("/:id", async (req, res) => {
  try {

    console.log("");
    console.log(
      "================================"
    );

    console.log(
      "UPDATE REQUEST"
    );

    console.log(
      "ID:",
      req.params.id
    );

    console.log(
      "DATA:",
      req.body
    );

    console.log(
      "================================"
    );

    const updatedInterview =
      await Interview.findByIdAndUpdate(
        req.params.id,

        {
          companyName:
            req.body.companyName,

          candidateName:
            req.body.candidateName,

          candidateEmail:
            req.body.candidateEmail,

          interviewerName:
            req.body.interviewerName,

          interviewDate:
            req.body.interviewDate,

          interviewTime:
            req.body.interviewTime,

          interviewType:
            req.body.interviewType,

          meetingLink:
            req.body.meetingLink,

          status:
            req.body.status ||
            "Scheduled"
        },

        {
          new: true,
          runValidators: true
        }
      );

    if (!updatedInterview) {

      return res.status(404).json({
        success: false,
        message:
          "Interview not found"
      });
    }

    console.log(
      "UPDATE SUCCESS:",
      updatedInterview._id
    );

    res.json({
      success: true,

      message:
        "Interview updated successfully",

      data:
        updatedInterview
    });

  } catch (error) {

    console.error(
      "UPDATE ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message
    });
  }
});

// =====================================================
// DELETE INTERVIEW
// =====================================================

router.delete("/:id", async (req, res) => {
  try {

    const deletedInterview =
      await Interview.findByIdAndDelete(
        req.params.id
      );

    if (!deletedInterview) {

      return res.status(404).json({
        success: false,
        message:
          "Interview not found"
      });
    }

    res.json({
      success: true,

      message:
        "Interview deleted successfully"
    });

  } catch (error) {

    console.error(
      "DELETE ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message
    });
  }
});

// =====================================================
// EXPORT
// =====================================================

module.exports = router;