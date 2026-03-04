const express = require("express");
const router = express.Router();
const { verifyOTP } = require("../controllers/authController");
const { resendOTP } = require("../controllers/authController");
const {
  registerUser,
  loginUser,
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-otp",verifyOTP);
router.post("/resend-otp", resendOTP);
module.exports = router;