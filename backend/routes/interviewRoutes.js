const express = require("express");

const router = express.Router();

const Interview = require("../models/Interview");

// =====================================================
// AUTO UPDATE COMPLETED INTERVIEWS
// DATE + TIME BASED
// =====================================================

async function updateCompletedInterviews() {
  try {
    // Only Scheduled interviews need checking
    const interviews = await Interview.find({
      status: "Scheduled"
    });

    const now = new Date();

    for (const interview of interviews) {

      // Safety check
      if (
        !interview.interviewDate ||
        !interview.interviewTime
      ) {
        continue;
      }

      // =================================================
      // GET INTERVIEW DATE
      // =================================================

      const interviewDate =
        new Date(interview.interviewDate);

      const year =
        interviewDate.getUTCFullYear();

      const month =
        interviewDate.getUTCMonth();

      const day =
        interviewDate.getUTCDate();

      // =================================================
      // GET INTERVIEW TIME
      // =================================================

      let time =
        interview.interviewTime
          .toString()
          .trim()
          .toUpperCase();

      let hours = 0;
      let minutes = 0;

      // =================================================
      // HANDLE 12-HOUR FORMAT
      // Example:
      // 07:15 PM
      // 11:00 AM
      // =================================================

      if (
        time.includes("AM") ||
        time.includes("PM")
      ) {

        const parts =
          time.split(/\s+/);

        const timePart =
          parts[0];

        const period =
          parts[1];

        const timeValues =
          timePart.split(":");

        hours =
          parseInt(
            timeValues[0],
            10
          );

        minutes =
          parseInt(
            timeValues[1],
            10
          );

        // PM conversion
        if (
          period === "PM" &&
          hours !== 12
        ) {
          hours += 12;
        }

        // 12 AM = 00
        if (
          period === "AM" &&
          hours === 12
        ) {
          hours = 0;
        }

      } else {

        // =================================================
        // HANDLE 24-HOUR FORMAT
        // Example:
        // 19:15
        // 11:00
        // =================================================

        const timeValues =
          time.split(":");

        hours =
          parseInt(
            timeValues[0],
            10
          );

        minutes =
          parseInt(
            timeValues[1],
            10
          );
      }

      // =================================================
      // CREATE INTERVIEW DATE + TIME
      //
      // India timezone:
      // IST = UTC + 5:30
      //
      // So convert IST time to UTC.
      // =================================================

      const interviewDateTime =
        new Date(
          Date.UTC(
            year,
            month,
            day,
            hours - 5,
            minutes - 30
          )
        );

      // =================================================
      // CHECK WHETHER INTERVIEW TIME HAS PASSED
      // =================================================

      if (
        interviewDateTime <= now
      ) {

        interview.status =
          "Completed";

        await interview.save();

        console.log(
          "================================"
        );

        console.log(
          "AUTO COMPLETED INTERVIEW"
        );

        console.log(
          "Candidate:",
          interview.candidateName
        );

        console.log(
          "Date:",
          interview.interviewDate
        );

        console.log(
          "Time:",
          interview.interviewTime
        );

        console.log(
          "================================"
        );
      }
    }

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

    // Automatically update
    // past interviews
    await updateCompletedInterviews();

    // Get all interviews
    const interviews =
      await Interview
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

      message:
        error.message

    });
  }
});


// =====================================================
// GET SINGLE INTERVIEW
// =====================================================

router.get("/:id", async (req, res) => {

  try {

    // Update status first
    await updateCompletedInterviews();

    const interview =
      await Interview.findById(
        req.params.id
      );

    // Interview not found
    if (!interview) {

      return res.status(404).json({

        success: false,

        message:
          "Interview not found"

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

      message:
        error.message

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

      message:
        error.message

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

    // Interview not found
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

    // Interview not found
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
// EXPORT ROUTER
// =====================================================

module.exports = router;