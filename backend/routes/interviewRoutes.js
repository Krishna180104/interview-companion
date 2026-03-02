const express = require("express");
const router = express.Router();
const { startInterview } = require("../controllers/interviewController");
const { protect } = require("../middleware/authMiddleware");
const { saveAnswer } = require("../controllers/interviewController");
const { evaluateInterview } = require("../controllers/interviewController");


router.post("/start", protect, startInterview);
router.post("/answer", protect, saveAnswer);
router.post("/evaluate", protect, evaluateInterview);
module.exports = router;