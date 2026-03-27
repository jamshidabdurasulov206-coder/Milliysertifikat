const express = require("express");
const router = express.Router();
const testController = require("../controllers/test.controller");

router.post("/", testController.createTest);
router.get("/", testController.getTests);
router.delete("/:id", testController.deleteTest);

module.exports = router;