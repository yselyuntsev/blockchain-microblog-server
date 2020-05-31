const router = require("express").Router();

const authController = require("../controllers/auth.controller");

router.post("/auth", authController.auth);
router.post("/register", authController.register);
router.post("/register/:broadcast", authController.register);

module.exports = router;
