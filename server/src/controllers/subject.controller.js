const subjectService = require("../services/subject.service");

exports.createSubject = async (req, res) => {
  try {
    const subject = await subjectService.createSubject(req.body);
    res.json(subject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getSubjects = async (req, res) => {
  try {
    const subjects = await subjectService.getSubjects();
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    await subjectService.deleteSubject(req.params.id);
    res.json({ message: "Subject deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};