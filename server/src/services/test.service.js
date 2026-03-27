exports.deleteTest = async (id) => {
  return await testModel.deleteTest(id);
};
const testModel = require("../models/test.model");

exports.createTest = async (data) => {
  if (!data.title) throw new Error("Title is required");
  if (!data.subject_id) throw new Error("Subject ID is required");
  return await testModel.createTest(data.title, data.description, data.subject_id);
};

exports.getTests = async () => {
  return await testModel.getTests();
};