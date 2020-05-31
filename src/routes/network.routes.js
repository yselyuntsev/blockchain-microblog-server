const router = require("express").Router();

const networkController = require("../controllers/network.controller");

router.get("/", networkController.getNodes);
router.get("/consensus", networkController.consensus);
router.get("/blockchain", networkController.getBlockchain);

router.post("/register-node", networkController.registerNode);
router.post("/register-bulk-nodes", networkController.registerBulkNodes);
router.post("/register-broadcast", networkController.broadcastRegister);

module.exports = router;
