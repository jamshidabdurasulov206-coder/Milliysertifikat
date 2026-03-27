const express = require("express");
const router = express.Router();
const attemptController = require("../controllers/attempt.controller");

router.post("/", attemptController.createAttempt);
router.get("/:testId", attemptController.getAttemptsByTest);

module.exports = router;