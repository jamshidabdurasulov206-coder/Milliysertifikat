exports.deleteSubject = async (id) => {
  return await subjectModel.deleteSubject(id);
};
const subjectModel = require("../models/subject.model");

exports.createSubject = async (data) => {
  if (!data.name) throw new Error("Subject name is required");
  return await subjectModel.createSubject(data.name);
};

exports.getSubjects = async () => {
  return await subjectModel.getSubjects();
};
