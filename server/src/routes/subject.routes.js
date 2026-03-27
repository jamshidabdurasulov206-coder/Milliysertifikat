const express = require("express");
const router = express.Router();
const subjectController = require("../controllers/subject.controller");

router.post("/", subjectController.createSubject);
router.get("/", subjectController.getSubjects);
router.delete("/:id", subjectController.deleteSubject);

module.exports = router;
