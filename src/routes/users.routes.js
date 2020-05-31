const router = require("express").Router();

const Jwt = require("../lib/jwt");
const usersController = require("../controllers/users.controller");

router.get("/:username", Jwt.verify, usersController.getUser);
router.get("/subscriptions/:username", Jwt.verify, usersController.getSubscriptions);

router.post("/subscribe", Jwt.verify, usersController.subscribe);
router.post("/subscribe/:broadcast", Jwt.verify, usersController.subscribe);
router.post("/unsubscribe", Jwt.verify, usersController.unsubscribe);
router.post("/unsubscribe/:broadcast", Jwt.verify, usersController.unsubscribe);

module.exports = router;
