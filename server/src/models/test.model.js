const pool = require("../config/db");

exports.createTest = async (title, description, subject_id) => {
  const res = await pool.query(
    "INSERT INTO tests (title, description, subject_id) VALUES ($1, $2, $3) RETURNING *",
    [title, description, subject_id]
  );
  return res.rows[0];
};

exports.getTests = async () => {
  const res = await pool.query(
    `SELECT tests.*, subjects.name as subject_name 
     FROM tests 
     LEFT JOIN subjects ON tests.subject_id = subjects.id 
     ORDER BY tests.id DESC`
  );
  return res.rows;
};

exports.deleteTest = async (id) => {
  const res = await pool.query("DELETE FROM tests WHERE id = $1", [id]);
  return res.rowCount > 0;
};