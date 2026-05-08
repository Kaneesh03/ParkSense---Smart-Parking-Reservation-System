const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

// Protected Routes mapped directly to authentication tokens natively
router.get("/me", authMiddleware, userController.getProfile);
router.put("/me", authMiddleware, userController.updateProfile);

router.get("/preferences", authMiddleware, userController.getPreferences);
router.put("/preferences", authMiddleware, userController.updatePreferences);

module.exports = router;
