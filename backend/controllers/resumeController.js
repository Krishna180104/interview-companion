const User = require("../models/User");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.user.id);

    // Save file path
    user.resume = req.file.path;

    // Send file to FastAPI
    const formData = new FormData();
    formData.append("file", fs.createReadStream(req.file.path));

    const aiResponse = await axios.post(
      `${process.env.AI_ENGINE_URL}/parse-resume`,
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    // Store parsed data
    user.parsedResume = aiResponse.data.data;

    await user.save();

    res.json({
      message: "Resume uploaded & parsed successfully",
      parsedData: user.parsedResume,
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Resume parsing failed" });
  }
};