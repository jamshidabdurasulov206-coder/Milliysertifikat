const attemptModel = require("../models/attempt.model");

exports.createAttempt = async (data) => {
  if (!data.test_id || !data.user_name || !data.answers || data.score == null)
    throw new Error("All fields required");
  return await attemptModel.createAttempt(data.test_id, data.user_name, data.answers, data.score);
};

exports.getAttemptsByTest = async (test_id) => {
  return await attemptModel.getAttemptsByTest(test_id);
};