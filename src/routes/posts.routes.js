const router = require("express").Router();

const Jwt = require("../lib/jwt");
const postsController = require("../controllers/posts.controller");

router.get("/all/:username/:offset", Jwt.verify, postsController.getPosts);
router.get("/feed/:username/:offset", Jwt.verify, postsController.getFeed);
router.get("/user/:username/:offset", Jwt.verify, postsController.getByUser);
router.get("/tag/:tag/:offset", Jwt.verify, postsController.getByTag);
router.get("/tags", Jwt.verify, postsController.getTags);

router.post("/", Jwt.verify, postsController.create);
router.post("/:broadcast", Jwt.verify, postsController.create);

module.exports = router;
