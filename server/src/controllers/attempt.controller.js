const attemptService = require("../services/attempt.service");

exports.createAttempt = async (req, res) => {
  try {
    const attempt = await attemptService.createAttempt(req.body);
    res.json(attempt);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAttemptsByTest = async (req, res) => {
  try {
    const attempts = await attemptService.getAttemptsByTest(req.params.testId);
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};