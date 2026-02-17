const express = require("express");
const router = express.Router();

const { getMe, updateOther } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/me", authMiddleware, getMe);
router.post("/update-other", authMiddleware, updateOther);

module.exports = router;
